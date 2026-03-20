const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});
const sendTicketPurchasedEmail = async ({ buyerEmail, buyerName, sellerEmail, sellerName, eventTitle, eventDate, eventVenue, seatNumber, category, price }) => {
  const formattedDate = new Date(eventDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  await transporter.sendMail({ from: `"TicketX" <${process.env.EMAIL_USER}>`, to: buyerEmail, subject: `Ticket Confirmed - ${eventTitle}`, html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#0f0f13;color:#f1f1f5;border-radius:12px;"><h1 style="color:#7c3aed;">TicketX</h1><h2 style="color:#10b981;">Ticket Confirmed!</h2><p>Hi ${buyerName},</p><p><b>Event:</b> ${eventTitle}</p><p><b>Date:</b> ${formattedDate}</p><p><b>Venue:</b> ${eventVenue}</p><p><b>Seat:</b> ${seatNumber} (${category})</p><p><b>Amount Paid:</b> <span style="color:#10b981;">Rs.${price}</span></p><a href="https://ticket-trading.vercel.app/my-tickets" style="color:#7c3aed;">View My Tickets</a></div>` });
  await transporter.sendMail({ from: `"TicketX" <${process.env.EMAIL_USER}>`, to: sellerEmail, subject: `Ticket Sold - ${eventTitle}`, html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#0f0f13;color:#f1f1f5;border-radius:12px;"><h1 style="color:#7c3aed;">TicketX</h1><h2 style="color:#10b981;">Your Ticket Was Sold!</h2><p>Hi ${sellerName}, your ticket was purchased by ${buyerName}.</p><p><b>Event:</b> ${eventTitle}</p><p><b>Seat:</b> ${seatNumber}</p><p><b>Amount Received:</b> <span style="color:#10b981;">Rs.${price}</span> (credited to wallet)</p><a href="https://ticket-trading.vercel.app/orders" style="color:#7c3aed;">View Orders</a></div>` });
};
module.exports = { sendTicketPurchasedEmail };
