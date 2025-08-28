import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

// Only set SendGrid API key if it exists
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const config = {
  email: process.env.FROM_EMAIL || "noreply@cloudrenovation.ca"
};

export async function POST(request: Request) {
  try {
    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY) {
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }
    const body = await request.json();
    const {
      fullName,
      email,
      phone,
      newsletter,
      selectedOption,
      data: {
        packageName,
        configuration,
        totalPrice,
        images,
        selectedMaterials,
      },
    } = body;

    // Header: logo
    const headerSection = `
<mj-section padding="0px">
  <mj-column width="100%">
    <mj-image width="100px" src="https://img.cloudrenovation.ca/Cloud%20Renovation%20logos/Cloud%20Renovation%20Logo.jpg" alt="CloudReno Logo" align="left" />
  </mj-column>
</mj-section>`;

    // Details: greeting, contact info, and package details
    const detailsSection = `
<mj-section background-color="#ffffff" padding="40px 24px" border-radius="8px">
  <mj-column width="100%">
    <mj-text font-size="24px" line-height="36px" font-weight="700" color="#1f2937">
      Thanks for Choosing Our Bathroom Package!
    </mj-text>
    <mj-text font-size="16px" line-height="24px" color="#4b5563">
      You can find your customized package information and quote below.
    </mj-text>
    <mj-divider border-color="#e5e7eb" padding="24px 0" />
    <mj-text font-size="16px" color="#4b5563">
      ${fullName}
    </mj-text>
    <mj-text font-size="16px" color="#4b5563">
      ${email}
    </mj-text>
    <mj-text font-size="16px" color="#4b5563">
      ${phone}
    </mj-text>
    <mj-text font-size="16px" color="#4b5563">
      Interested in receiving newsletter: ${newsletter ? "Yes" : "No"}
    </mj-text>
    <mj-text font-size="16px" color="#4b5563">
      Contractor Preference: ${
        selectedOption === "vetted"
          ? "Requested vetted contractor"
          : "Has own contractor"
      }
    </mj-text>
    <mj-spacer height="24px" />
    <mj-text font-size="18px" font-weight="600" color="#1f2937">
      Package Details
    </mj-text>
    <mj-text font-size="16px" color="#4b5563">
      ${packageName}
    </mj-text>
    <mj-text font-size="16px" line-height="20px" color="#4b5563">
      Size: ${configuration.size} | Type: ${
      configuration.type
    } | Dry Area Tiles: ${configuration.dryAreaTiles}
    </mj-text>
    <mj-text font-size="16px" color="#4b5563">
      Total Price: $${totalPrice.toLocaleString()}
    </mj-text>
  </mj-column>
</mj-section>`;

    // Package image: use first image from the images array
    const packageImageSection = `
<mj-section background-color="#ffffff" padding="0px" border-radius="8px">
  <mj-column width="100%">
    <mj-image src="${
      images[0] || ""
    }" alt="${packageName}" width="300px" padding="10px" />
  </mj-column>
</mj-section>`;

    // Materials header
    const materialsHeaderSection = `
<mj-section background-color="#ffffff" padding="20px" border-radius="8px">
  <mj-column width="100%">
    <mj-text font-size="26px" font-weight="300" color="#1f2937">
      Materials
    </mj-text>
  </mj-column>
</mj-section>`;

    // Materials grid: each row is its own top-level section with two columns
    let materialsRows = "";
    for (let i = 0; i < selectedMaterials.length; i += 2) {
      let row = `<mj-section background-color="#ffffff" padding="20px" border-radius="8px">`;
      const m1 = selectedMaterials[i];
      row += `
  <mj-column width="50%">
    <mj-image src="${m1.image}" alt="${m1.name}" width="150px" align="left" />
    <mj-text font-size="16px" color="#1f2937" font-weight="600">
      ${m1.type}: ${m1.name}
    </mj-text>
    <mj-text font-size="14px" line-height="20px" color="#4b5563">
      ${m1.description || ""}
    </mj-text>
    <mj-text font-size="12px" line-height="16px" color="#6b7280">
      Brand: ${m1.brand} | SKU: ${m1.sku}
    </mj-text>
  </mj-column>`;
      if (i + 1 < selectedMaterials.length) {
        const m2 = selectedMaterials[i + 1];
        row += `
  <mj-column width="50%">
    <mj-image src="${m2.image}" alt="${m2.name}" width="150px" align="left" />
    <mj-text font-size="16px" color="#1f2937" font-weight="600">
      ${m2.type}: ${m2.name}
    </mj-text>
    <mj-text font-size="14px" line-height="20px" color="#4b5563">
      ${m2.description || ""}
    </mj-text>
    <mj-text font-size="12px" line-height="16px" color="#6b7280">
      Brand: ${m2.brand} | SKU: ${m2.sku}
    </mj-text>
  </mj-column>`;
      }
      row += `</mj-section>`;
      materialsRows += row;
    }

    const emailContent = `
<mjml>
  <mj-head>
    <mj-title>Your ${packageName} Bathroom Package Details</mj-title>
    <mj-font name="Inter" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" />
    <mj-attributes>
      <mj-all font-family="Inter, Helvetica, Arial, sans-serif" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#f8fafc">
    ${headerSection}
    ${detailsSection}
    ${packageImageSection}
    ${materialsHeaderSection}
    ${materialsRows}
  </mj-body>
</mjml>`;

    // Dynamic import to avoid build issues
    const mjml2html = (await import("mjml")).default;
    const { html } = mjml2html(emailContent, { minify: true });
    const msg: sgMail.MailDataRequired = {
      to: email,
      from: config.email,
      subject: `Your ${packageName} Bathroom Package Details`,
      html,
    };

    if (email.toLowerCase() !== process.env.ADMIN_EMAIL) {
      msg.cc = process.env.ADMIN_EMAIL;
    }

    await sgMail.send(msg);

    // Create a lead in HubSpot
    const hubspotUrl = "https://api.hubapi.com/contacts/v1/contact/";
    const hubspotData = {
      properties: [
        { property: "email", value: email },
        { property: "firstname", value: fullName },
        { property: "phone", value: phone },
        // { property: "newsletter", value: newsletter ? "true" : "false" },
        // { property: "package_name", value: packageName },
        // { property: "configuration", value: JSON.stringify(configuration) },
        // { property: "total_price", value: totalPrice.toString() },
      ],
    };

    const hubspotRes = await fetch(hubspotUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
      },
      body: JSON.stringify(hubspotData),
    });

    if (!hubspotRes.ok) {
      const errorText = await hubspotRes.text();
      console.error("Error creating HubSpot lead:", errorText);
      return NextResponse.json(
        { error: "Failed to create HubSpot lead" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Email sent and lead created successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}