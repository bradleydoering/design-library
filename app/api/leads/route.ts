import { NextRequest, NextResponse } from 'next/server';

interface LeadData {
  name: string;
  email: string;
  phone: string;
  city: string;
  projectDescription: string;
}

// Email sending function
async function sendLeadEmail(leadData: LeadData) {
  const emailContent = `
    <h2>🎯 New Lead from Pricing Gate</h2>
    <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
    <p><strong>Source:</strong> CloudReno Pricing Gate</p>
    
    <h3>Contact Information:</h3>
    <ul>
      <li><strong>Name:</strong> ${leadData.name}</li>
      <li><strong>Email:</strong> <a href="mailto:${leadData.email}">${leadData.email}</a></li>
      <li><strong>Phone:</strong> <a href="tel:${leadData.phone}">${leadData.phone}</a></li>
      <li><strong>City:</strong> ${leadData.city}</li>
    </ul>
    
    <h3>Project Description:</h3>
    <p>${leadData.projectDescription}</p>
    
    <hr>
    <p><em>This lead was captured through the CloudReno pricing gate system.</em></p>
  `;

  // Using the existing email API route
  try {
    const emailResponse = await fetch(`${process.env.NEXTJS_URL || 'http://localhost:3000'}/packages/api/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: process.env.LEAD_EMAIL || 'your-email@example.com', // Set this in your .env file
        subject: `🎯 New Lead: ${leadData.name} from ${leadData.city}`,
        html: emailContent,
        text: `
New Lead from Pricing Gate

Name: ${leadData.name}
Email: ${leadData.email}
Phone: ${leadData.phone}
City: ${leadData.city}

Project Description:
${leadData.projectDescription}

Timestamp: ${new Date().toLocaleString()}
        `
      }),
    });

    if (!emailResponse.ok) {
      throw new Error('Failed to send email');
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to send lead email:', error);
    return { success: false, error };
  }
}

export async function POST(request: NextRequest) {
  try {
    const leadData: LeadData = await request.json();
    
    // Validate required fields
    const { name, email, phone, city, projectDescription } = leadData;
    
    if (!name || !email || !phone || !city || !projectDescription) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Generate lead ID
    const leadId = Math.random().toString(36).substr(2, 9);
    
    // Log the lead
    console.log('New lead captured:', {
      leadId,
      ...leadData,
      timestamp: new Date().toISOString(),
      source: 'pricing_gate'
    });
    
    // Send email notification
    const emailResult = await sendLeadEmail(leadData);
    
    if (!emailResult.success) {
      console.error('Email sending failed, but continuing with lead processing');
    }
    
    // You can also add additional integrations here:
    // - Save to database
    // - Send to CRM (HubSpot, Salesforce, etc.)
    // - Send to Slack
    // - Add to Google Sheets
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Lead captured successfully',
        leadId,
        emailSent: emailResult.success
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