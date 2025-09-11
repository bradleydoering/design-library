import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

interface LeadData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  projectDescription: string;
}

import { sendEmail } from '../../../lib/send-email';

// Handle lead updates
export async function PATCH(request: NextRequest) {
  const supabaseUrl = process.env.LEADS_SUPABASE_URL;
  const supabaseKey = process.env.LEADS_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials for leads');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  try {
    const { leadId, ...updateData } = await request.json();
    
    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead ID is required for updates' },
        { status: 400 }
      );
    }

    // Map field names to database columns for update
    const dbUpdateData: any = {};
    if (updateData.firstName) dbUpdateData.first_name = updateData.firstName;
    if (updateData.lastName) dbUpdateData.last_name = updateData.lastName;
    if (updateData.email) dbUpdateData.email = updateData.email;
    if (updateData.phone) dbUpdateData.phone_number = updateData.phone;
    if (updateData.city) dbUpdateData.city = updateData.city;
    if (updateData.projectDescription) dbUpdateData.project_description = updateData.projectDescription;
    
    // Update lead in Supabase
    const { data, error } = await supabase
      .from('leads')
      .update(dbUpdateData)
      .eq('id', leadId)
      .select();

    if (error) {
      console.error('Error updating lead in Supabase:', error);
      return NextResponse.json(
        { error: 'Failed to update lead' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Lead updated successfully',
        leadId: leadId,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error processing lead update:', error);
    return NextResponse.json(
      { error: 'Failed to process lead update' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.LEADS_SUPABASE_URL;
  const supabaseKey = process.env.LEADS_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials for leads');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  try {
    console.log("--- /api/leads endpoint hit ---"); // Added for debugging
    console.log('LEADS_SUPABASE_URL:', process.env.LEADS_SUPABASE_URL ? 'Loaded' : 'MISSING'); // Added for debugging
    console.log('LEADS_SUPABASE_SERVICE_ROLE_KEY:', process.env.LEADS_SUPABASE_SERVICE_ROLE_KEY ? 'Loaded' : 'MISSING'); // Added for debugging
    console.log('LEAD_EMAIL:', process.env.LEAD_EMAIL);

    const leadData: Partial<LeadData> = await request.json();
    console.log('Received lead data:', JSON.stringify(leadData, null, 2)); // Added for debugging
    
    // For partial saves, we only require fields that are provided
    const { firstName, lastName, email, phone, city, projectDescription, isPartial } = leadData as any;
    
    // Basic validation - at minimum we need firstName, lastName, email for initial save
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^S@]+@[^S@]+\.[^S@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Save lead to Supabase (only include fields that are provided)
    const leadRecord: any = {
      first_name: firstName,
      last_name: lastName,
      email: email,
    };
    
    if (phone) leadRecord.phone_number = phone;
    if (city) leadRecord.city = city;
    if (projectDescription) leadRecord.project_description = projectDescription;
    
    const { data, error } = await supabase
      .from('leads')
      .insert([leadRecord])
      .select();

    if (error) {
      console.error('Error saving lead to Supabase:', error);
      return NextResponse.json(
        { error: 'Failed to save lead' },
        { status: 500 }
      );
    }

    // Send email notification only for complete submissions (not partial saves)
    if (!isPartial && projectDescription) {
      const emailContent = `
        <h2>🎯 New Lead from Pricing Gate</h2>
        <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Source:</strong> CloudReno Pricing Gate</p>
        
        <h3>Contact Information:</h3>
        <ul>
          <li><strong>Name:</strong> ${firstName} ${lastName}</li>
          <li><strong>Email:</strong> <a href="mailto:${email}">${email}</a></li>
          <li><strong>Phone:</strong> <a href="tel:${phone}">${phone || 'Not provided'}</a></li>
          <li><strong>City:</strong> ${city || 'Not provided'}</li>
        </ul>
        
        <h3>Project Description:</h3>
        <p>${projectDescription}</p>
        
        <hr>
        <p><em>This lead was captured through the CloudReno pricing gate system.</em></p>
      `;

      try {
        await sendEmail({
          to: process.env.LEAD_EMAIL || 'your-email@example.com',
          subject: `🎯 New Lead: ${firstName} ${lastName}${city ? ` from ${city}` : ''}`,
          html: emailContent,
          text: `New Lead from Pricing Gate\n\nName: ${firstName} ${lastName}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\nCity: ${city || 'Not provided'}\n\nProject Description:\n${projectDescription}\n\nTimestamp: ${new Date().toLocaleString()}`
        });
      } catch (emailError) {
        console.error('Email sending failed, but continuing with lead processing', emailError);
      }
    }
    
    return NextResponse.json(
      {
        success: true,
        message: 'Lead captured successfully',
        leadId: data ? data[0].id : null,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error processing lead:', error);
    return NextResponse.json(
      { error: 'Failed to process lead submission' },
      { status: 500 }
    );
  }
}
