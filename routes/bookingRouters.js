const express = require('express');
const router = express.Router();
const Booking = require('../models/bookingModel.js');
const nodemailer = require('nodemailer');
const axios = require('axios'); // We need this for the price API

// --- List of Premium Design Names ---
const premiumDesigns = new Set([
    'Hipper Mona',
    'WorkLoad',
    'Next-Gen',
    'Magnetic-pull'
]);

// --- Reusable Price Logic Function ---
const getPriceInfoForIp = async (ip) => {
    try {
        // Use a test IP for localhost, otherwise use the real visitor's IP
        const userIp = ip === '::1' ? '49.36.127.255' : ip; 
        
        // Call the API to get the country
        const geoResponse = await axios.get(`https://ipinfo.io/${userIp}?token=${process.env.IPINFO_API_KEY}`);
        const countryCode = geoResponse.data.country;

        // If the country is India, return Rupee prices
        if (countryCode === 'IN') {
            return {
                symbol: '₹',
                plans: { basic: 800, premium: 2000 }
            };
        }
    } catch (error) {
        // If anything goes wrong, log the error and use the default price below
        console.error("Error fetching price info, using default.", error);
    }
    
    // This is the default price for all other countries
    return {
        symbol: '$',
        plans: { basic: 30, premium: 100 }
    };
};
// =============================================================
// --- API ENDPOINT TO GET THE PRICE BASED ON LOCATION ---
// =============================================================
router.get('/getPrice', async (req, res) => {
    // Call our new reusable function to get the price
    const priceInfo = await getPriceInfoForIp(req.ip);
    
    // Send the result back to the frontend
    res.json(priceInfo);
});

// send email to user and admin
const sendBookingEmails = async (savedBooking, priceInfo) => {
    try {
        console.log('Processing emails in the background...');

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // --- Price Calculation Logic (Stays the same) ---
        let originalPrice;
        if (premiumDesigns.has(savedBooking.theme)) {
            originalPrice = priceInfo.plans.premium;
        } else {
            originalPrice = priceInfo.plans.basic;
        }
        const discountAmount = originalPrice * 0.10;
        const finalPrice = originalPrice - discountAmount;
        // --- End Calculation ---

        // Email to the User with final text and styling
        const mailToUser = {
            from: process.env.EMAIL_USER,
            to: savedBooking.email,
            subject: '🚀 You\'re In! Your BroTech Studio Booking is Confirmed',
            html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta name="color-scheme" content="light dark">
                <meta name="supported-color-schemes" content="light dark">
                <style> body { font-family: 'Inter', Arial, sans-serif; } </style>
            </head>
            <body style="margin: 0; padding: 0; background-color: #111827; color: #E5E7EB;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto;">
                    
                    <!-- Logo Section -->
                    <tr>
                        <td align="center" style="padding: 40px 0;">
                            <table border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="background-color: #000000; color: #FFFFFF; font-size: 24px; font-weight: 700; padding: 12px 18px; border: 2px solid #374151; border-right: none; letter-spacing: 1px;">
                                        BROTECH
                                    </td>
                                    <td align="center" style="background-color: #FFFFFF; color: #000000; font-size: 24px; font-weight: 700; padding: 12px 18px; border: 2px solid #374151; border-left: none; letter-spacing: 1px;">
                                        STUDIO
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Main Content Section -->
                    <tr>
                        <td style="padding: 0 20px;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1F2937; border-radius: 8px; border: 1px solid #374151; padding: 40px; color: #E5E7EB;">
                                <tr>
                                    <td style="font-size: 22px; font-weight: 600; color: #FFFFFF;">
                                        Hey ${savedBooking.fullName},
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-top: 20px; font-size: 16px; line-height: 1.6; color: #E5E7EB;">
                                        🎉 Get ready! We've officially confirmed your booking and the creative gears are already turning.
                                    </td>
                                </tr>

                                <!-- Booking Details -->
                                <tr>
                                    <td style="padding-top: 30px;">
                                        <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #374151; border-radius: 6px; padding: 20px;">
                                            <tr>
                                                <td style="color: #9CA3AF; font-size: 14px; padding-bottom: 5px;">THEME SELECTED</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #FFFFFF; font-size: 18px; font-weight: 600;">
                                                    <em>${savedBooking.theme}</em>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <!-- Price Breakdown Section -->
                                <tr>
                                    <td style="padding-top: 30px;">
                                        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <tr style="height: 35px;">
                                                <td style="font-size: 16px; color: #9CA3AF;">Original Price</td>
                                                <td style="font-size: 16px; color: #9CA3AF; text-decoration: line-through;" align="right">${priceInfo.symbol}${originalPrice}</td>
                                            </tr>
                                            <tr style="height: 35px;">
                                                <td style="font-size: 16px; color: #10B981;">10% Monthly Discount</td>
                                                <td style="font-size: 16px; color: #10B981; font-weight: bold;" align="right">– ${priceInfo.symbol}${discountAmount}</td>
                                            </tr>
                                            <tr><td colspan="2" style="border-top: 1px solid #374151; padding-top:15px;"></td></tr>
                                            <tr style="height: 50px;">
                                                <td style="font-size: 18px; font-weight: bold; color: #FFFFFF;">Your Total</td>
                                                <td style="font-size: 22px; font-weight: bold; color: #FFFFFF;" align="right">${priceInfo.symbol}${finalPrice}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <!-- UPDATED: What's Next Section -->
                                <tr>
                                    <td style="padding-top: 40px; font-size: 16px; line-height: 1.7; color: #E5E7EB;">
                                        <h3 style="margin: 0; padding-bottom: 10px; font-size: 18px; color: #FFFFFF;">Here’s what happens next:</h3>
                                        We'll review your booking details. <br>
                                        You’ll hear from us within the next 24 hours. <br>
                                        Then, the magic begins! ✨
                                        <p style="margin-top: 25px;">Thanks again for choosing us. Let’s build something legendary. 💪</p>
                                        <p style="margin-top: 20px; font-weight: bold;">– The BroTech Studio Team 🚀</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- UPDATED: Footer -->
                    <tr>
                        <td align="center" style="padding: 40px 0 20px 0; font-size: 12px; color: #6B7280;">
                            BroTech Studio | yourwebsite.com
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            `
        };
        // This is the notification email to you, which can remain simple
        const mailToAdmin = {
          from: process.env.EMAIL_USER,
          to: process.env.ADMIN_EMAIL,
          subject: '🚀 New Portfolio Booking!',
          html: `
              <h1>You have a new booking!</h1>
              <p><strong>Name:</strong> ${savedBooking.fullName}</p>
              <p><strong>Email:</strong> ${savedBooking.email}</p>
              <p><strong>Country:</strong> ${savedBooking.country}</p>
              <p><strong>Theme:</strong> ${savedBooking.theme}</p>
              <p><strong>Delivery Time:</strong> ${savedBooking.deliveryTime}</p>
              <p>Check the database for full details.</p>
          `
        };

        await transporter.sendMail(mailToUser);
        console.log('New designed confirmation email sent to the user.');
        await transporter.sendMail(mailToAdmin);
        console.log('Notification email sent to admin.');

    } catch (emailError) {
        console.error('EMAIL BATTLE! An error occurred while sending emails:', emailError);
    }
};

router.post('/', async (req, res) => {
    try {
        const rawData = req.body;
        const bookingData = {
            email: rawData.email,
            fullName: rawData.fullName,
            country: rawData.country,
            courseDetails: rawData.courseDetails,
            theme: rawData.theme,
            resumeInfo: rawData.resumeInfo,
            createResumeDetails: rawData.createResumeDetails,
            deliveryTime: rawData.deliveryTime,
            paymentMethod: rawData.paymentMethod,
            specialRequests: rawData.specialRequests,
            bioDetails: rawData.bioDetails,
            projectLinks: rawData.projectLinks,
            socialMediaLinks: rawData.socialMediaLinks,
            includedFeatures: {},
            responsiveDevices: {}
        };

        const allFeatures = ['resumeDownload', 'socialLinks', 'projectsLinks', 'manualContactForm', 'ContactButton', 'singlePage', 'deploymentHelp'];
        const allDevices = ['tablets', 'largeTablets', 'laptop', 'largeLaptop'];

        allFeatures.forEach(feature => {
            bookingData.includedFeatures[feature] = (rawData[feature] === 'on');
        });

        allDevices.forEach(device => {
            bookingData.responsiveDevices[device] = (rawData[device] === 'on');
        });

        const newBooking = new Booking(bookingData);
        const savedBooking = await newBooking.save();
        
        // Get the price info for the user who just booked
        const priceInfo = await getPriceInfoForIp(req.ip);

        console.log('VICTORY! Booking saved to DB. Redirecting user immediately...');
        res.redirect('/thank-you.html');

        // Now, pass BOTH the booking and the price info to the email function
        sendBookingEmails(savedBooking, priceInfo);

    } catch (error) {
        console.error('FINAL BOSS BATTLE! An error occurred:', error);
        res.status(500).send('Sorry, something went wrong! Check the server logs.');
    }
});

module.exports = router;