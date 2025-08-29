import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

interface LeadData {
  name: string;
  email: string;
  phone: string;
  city: string;
  projectDescription: string;
}

import { sendEmail } from '../../../lib/send-email';

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

    const leadData: LeadData = await request.json();
    console.log('Received lead data:', JSON.stringify(leadData, null, 2)); // Added for debugging
    
    // Validate required fields
    const { name, email, phone, city, projectDescription } = leadData;
    
    if (!name || !email || !phone || !city || !projectDescription) {
      return NextResponse.json(
        { error: 'All fields are required' },
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
    
    // Save lead to Supabase
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    const { data, error } = await supabase
      .from('leads')
      .insert([
        {
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone_number: phone,
          city: city,
          project_description: projectDescription,
        },
      ])
      .select();

    if (error) {
      console.error('Error saving lead to Supabase:', error);
      return NextResponse.json(
        { error: 'Failed to save lead' },
        { status: 500 }
      );
    }

    // Send email notification
    const emailContent = `
      <h2>🎯 New Lead from Pricing Gate</h2>
      <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Source:</strong> CloudReno Pricing Gate</p>
      
      <h3>Contact Information:</h3>
      <ul>
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Email:</strong> <a href="mailto:${email}">${email}</a></li>
        <li><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></li>
        <li><strong>City:</strong> ${city}</li>
      </ul>
      
      <h3>Project Description:</h3>
      <p>${projectDescription}</p>
      
      <hr>
      <p><em>This lead was captured through the CloudReno pricing gate system.</em></p>
    `;

    try {
      await sendEmail({
        to: process.env.LEAD_EMAIL || 'your-email@example.com',
        subject: `🎯 New Lead: ${name} from ${city}`,
        html: emailContent,
        text: `New Lead from Pricing Gate\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nCity: ${city}\n\nProject Description:\n${projectDescription}\n\nTimestamp: ${new Date().toLocaleString()}`
      });
    } catch (emailError) {
      console.error('Email sending failed, but continuing with lead processing', emailError);
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
