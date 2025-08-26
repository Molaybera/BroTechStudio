// models/booking.model.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    // Personal Info
    email: { type: String, required: true },
    fullName: { type: String, required: true },
    country: { type: String, required: true },
    courseDetails: { type: String, required: true }, 

    // Portfolio Choices
    theme: { type: String, required: true },
    includedFeatures: {
        resumeDownload: { type: Boolean, default: false },
        socialLinks: { type: Boolean, default: false },
        projectsLinks: { type: Boolean, default: false },
        manualContactForm: { type: Boolean, default: false },
        ContactButton: { type: Boolean, default: false },
        singlePage: { type: Boolean, default: false },
        deploymentHelp: { type: Boolean, default: false },
    },
    resumeInfo: { type: String, required: true },
    createResumeDetails: { type: String }, // Not required

    // Logistics
    deliveryTime: { type: String, required: true }, // How soon?
    responsiveDevices: {
        tablets: { type: Boolean, default: false },
        largeTablets: { type: Boolean, default: false },
        laptop: { type: Boolean, default: false },
        largeLaptop: { type: Boolean, default: false },
    },
    paymentMethod: { type: String, required: true },

    // Extra Details
    specialRequests: { type: String },
    bioDetails: { type: String },
    projectLinks: { type: String },
    socialMediaLinks: { type: String },
}, {
    // This adds 'createdAt' and 'updatedAt' fields automatically
    timestamps: true,
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;