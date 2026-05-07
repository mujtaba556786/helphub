/**
 * Centralized mock data for all Helpmate tests.
 * Used by MockServer.js (OPA5) and unit tests directly.
 * Matches the shape of real API responses so tests work with server down.
 */
sap.ui.define([], function () {
    "use strict";

    // ── Users ─────────────────────────────────────────────────────────────────

    var USER = {
        id: "U_TEST_001",
        name: "Julia Tester",
        email: "julia@test.com",
        role: "Customer",
        status: "Active",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=julia",
        onboarded: true,
        terms_accepted_at: "2024-01-01T00:00:00.000Z",
        terms_version: "1.0",
        subscription_plan: "free",
        monthly_booking_value: 0
    };

    // Provider account — used to test provider-specific features (category limits, earnings chip, etc.)
    var PROVIDER_USER = {
        id: "U_PROVIDER_001",
        name: "Alex Provider",
        email: "alex@test.com",
        role: "provider",
        status: "Active",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
        onboarded: true,
        terms_accepted_at: "2024-01-01T00:00:00.000Z",
        terms_version: "1.0",
        subscription_plan: "free",
        monthly_booking_value: 320,       // above soft nudge threshold (€300)
        service_categories: "Cleaning",
        lat: 52.52, lng: 13.405,
        city: "Berlin"
    };

    var PRO_PROVIDER_USER = {
        id: "U_PROVIDER_002",
        name: "Pro Provider",
        email: "pro@test.com",
        role: "provider",
        status: "Active",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=pro",
        onboarded: true,
        terms_accepted_at: "2024-01-01T00:00:00.000Z",
        terms_version: "1.0",
        subscription_plan: "pro",
        monthly_booking_value: 1200,
        service_categories: "Cleaning,Gardening,Handyman",
        lat: 52.525, lng: 13.41,
        city: "Berlin"
    };

    // ── Providers ─────────────────────────────────────────────────────────────
    // 7 providers so ad-injection at every 6th card is testable (index 5 gets an ad)
    // Mix of free/pro and one featured (sponsored) provider

    var FEATURED_UNTIL = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(); // 7 days from now

    var PROVIDERS = [
        {
            id: "p1",
            name: "Sarah Martinez",
            photo: "https://randomuser.me/api/portraits/women/65.jpg",
            bio: "Urban gardening expert with 3 years experience.",
            rating: 4.9,
            rate: 25,
            currency: "EUR",
            city: "Berlin",
            lat: 52.5250,
            lng: 13.4100,
            languages: "EN, DE",
            years: 3,
            availability: "all_day",
            serviceType: "Gardening",
            service_categories: "Gardening",
            phone: "+49123456789",
            subscription_plan: "free",
            featured_until: null,
            featured_category: null,
            monthly_booking_value: 180
        },
        {
            id: "p2",
            name: "Emma Johnson",
            photo: "https://randomuser.me/api/portraits/women/44.jpg",
            bio: "Certified childcare specialist, 5 years experience.",
            rating: 5.0,
            rate: 20,
            currency: "EUR",
            city: "Berlin",
            lat: 52.5100,
            lng: 13.3900,
            languages: "EN",
            years: 5,
            availability: "weekdays,morning",
            serviceType: "Babysitting",
            service_categories: "Babysitting",
            phone: "+49987654321",
            subscription_plan: "pro",             // Pro provider — badge test
            featured_until: null,
            featured_category: null,
            monthly_booking_value: 850
        },
        {
            id: "p3",
            name: "Raj Patel",
            photo: "https://randomuser.me/api/portraits/men/29.jpg",
            bio: "Home chef specialising in Indian cuisine.",
            rating: 4.8,
            rate: 30,
            currency: "EUR",
            city: "Berlin",
            lat: 52.5155,
            lng: 13.4020,
            languages: "EN, HI",
            years: 7,
            availability: "weekends,evening",
            serviceType: "Cooking",
            service_categories: "Cooking",
            phone: "+49111222333",
            subscription_plan: "free",
            featured_until: null,
            featured_category: null,
            monthly_booking_value: 240
        },
        {
            id: "p4",
            name: "Lisa Chen",
            photo: "https://randomuser.me/api/portraits/women/52.jpg",
            bio: "Professional home cleaner, eco-friendly products.",
            rating: 4.95,
            rate: 22,
            currency: "EUR",
            city: "Berlin",
            lat: 52.5180,
            lng: 13.3950,
            languages: "EN, ZH",
            years: 4,
            availability: "all_day",
            serviceType: "Cleaning",
            service_categories: "Cleaning",
            phone: "+49444555666",
            subscription_plan: "pro",
            featured_until: FEATURED_UNTIL,       // sponsored provider — floats to top
            featured_category: "Cleaning",
            monthly_booking_value: 1100
        },
        {
            id: "p5",
            name: "Tom Walker",
            photo: "https://randomuser.me/api/portraits/men/41.jpg",
            bio: "Reliable home cleaner, flexible hours.",
            rating: 4.6,
            rate: 18,
            currency: "EUR",
            city: "Berlin",
            lat: 52.5300,
            lng: 13.4200,
            languages: "EN, DE",
            years: 2,
            availability: "weekdays,afternoon",
            serviceType: "Cleaning",
            service_categories: "Cleaning",
            phone: "+49777888999",
            subscription_plan: "free",
            featured_until: null,
            featured_category: null,
            monthly_booking_value: 95
        },
        {
            id: "p6",
            name: "Anna Schmidt",
            photo: "https://randomuser.me/api/portraits/women/30.jpg",
            bio: "Deep clean specialist, offices and homes.",
            rating: 4.7,
            rate: 20,
            currency: "EUR",
            city: "Berlin",
            lat: 52.5090,
            lng: 13.4080,
            languages: "DE",
            years: 6,
            availability: "weekdays,morning",
            serviceType: "Cleaning",
            service_categories: "Cleaning",
            phone: "+49321654987",
            subscription_plan: "pro",
            featured_until: null,
            featured_category: null,
            monthly_booking_value: 620
        },
        {
            id: "p7",
            name: "Marco Rossi",
            photo: "https://randomuser.me/api/portraits/men/55.jpg",
            bio: "Handyman — plumbing, electrics, general repairs.",
            rating: 4.5,
            rate: 35,
            currency: "EUR",
            city: "Berlin",
            lat: 52.5220,
            lng: 13.3880,
            languages: "EN, IT",
            years: 10,
            availability: "all_day",
            serviceType: "Handyman",
            service_categories: "Handyman",
            phone: "+49654321789",
            subscription_plan: "free",
            featured_until: null,
            featured_category: null,
            monthly_booking_value: 410
        }
    ];

    // ── Services ──────────────────────────────────────────────────────────────

    var SERVICES = [
        { id: "S1",  name: "Cleaning",     category: "Home",      icon: "🧹", status: "Active", description: "Home and office cleaning.", is_hero: true },
        { id: "S2",  name: "Gardening",    category: "Home",      icon: "🌱", status: "Active", description: "Garden maintenance.", is_hero: false },
        { id: "S3",  name: "Handyman",     category: "Home",      icon: "🔧", status: "Active", description: "General home repairs.", is_hero: false },
        { id: "S4",  name: "Babysitting",  category: "Care",      icon: "👶", status: "Active", description: "Trusted childcare.", is_hero: false },
        { id: "S5",  name: "Elder Care",   category: "Care",      icon: "🧓", status: "Active", description: "Companionship and care.", is_hero: false },
        { id: "S6",  name: "Pet Care",     category: "Care",      icon: "🐕", status: "Active", description: "Dog walking and pet sitting.", is_hero: false },
        { id: "S7",  name: "Transport",    category: "Transport", icon: "🚗", status: "Active", description: "Reliable rides.", is_hero: false },
        { id: "S8",  name: "Groceries",    category: "Transport", icon: "🛒", status: "Active", description: "Grocery delivery.", is_hero: false },
        { id: "S9",  name: "Cooking",      category: "Wellness",  icon: "👨‍🍳", status: "Active", description: "Home-cooked meals.", is_hero: false },
        { id: "S10", name: "Massage",      category: "Wellness",  icon: "💆", status: "Active", description: "Professional massage.", is_hero: false },
        { id: "S11", name: "Math Tuition", category: "Skills",    icon: "📐", status: "Active", description: "One-on-one math lessons.", is_hero: false },
        { id: "S12", name: "IT Support",   category: "Skills",    icon: "💻", status: "Active", description: "Tech help and setup.", is_hero: false }
    ];

    // ── Home Activity ─────────────────────────────────────────────────────────
    // Mock response for GET /api/home/activity

    var HOME_ACTIVITY = {
        success: true,
        helpers: 24,
        requests: 7,
        recent: [
            { service: "Cleaning",  city: "Berlin Mitte" },
            { service: "Gardening", city: "Berlin Prenzlauer Berg" },
            { service: "Babysitting", city: "Berlin Kreuzberg" }
        ]
    };

    // ── Subscription Status ───────────────────────────────────────────────────

    var SUBSCRIPTION_STATUS = {
        success: true,
        plan: "free",
        monthly_booking_value: 320,
        threshold: 500,
        threshold_percent: 64,
        soft_cap_reached: false,
        hard_cap_reached: false,
        days_until_reset: 12
    };

    var SUBSCRIPTION_STATUS_NEAR_CAP = {
        success: true,
        plan: "free",
        monthly_booking_value: 480,
        threshold: 500,
        threshold_percent: 96,
        soft_cap_reached: true,
        hard_cap_reached: false,
        days_until_reset: 3
    };

    // ── Bookings ──────────────────────────────────────────────────────────────

    var BOOKINGS = [
        {
            id: "B1",
            customer_id: "U_TEST_001",
            customer_name: "Julia Tester",
            provider_id: "p1",
            provider_name: "Sarah Martinez",
            service: "Gardening",
            scheduled_date: "2024-12-20",
            status: "confirmed",
            total_price: 25,
            is_seen: 1,
            created_at: "2024-12-15T10:00:00.000Z"
        },
        {
            id: "B2",
            customer_id: "U_TEST_001",
            customer_name: "Julia Tester",
            provider_id: "p2",
            provider_name: "Emma Johnson",
            service: "Babysitting",
            scheduled_date: "2024-12-22",
            status: "pending",
            total_price: 20,
            is_seen: 0,
            created_at: "2024-12-16T09:00:00.000Z"
        },
        {
            id: "B3",
            customer_id: "U_TEST_001",
            customer_name: "Julia Tester",
            provider_id: "p4",
            provider_name: "Lisa Chen",
            service: "Cleaning",
            scheduled_date: "2024-12-24",
            status: "completed",
            total_price: 22,
            is_seen: 1,
            created_at: "2024-12-10T08:00:00.000Z"
        }
    ];

    // ── Notifications ─────────────────────────────────────────────────────────

    var NOTIFICATIONS = [
        {
            id: "N1",
            user_id: "U_TEST_001",
            type: "booking_request",
            title: "New booking request",
            message: "Someone wants to book you.",
            is_read: 0,
            created_at: new Date(Date.now() - 300000).toISOString()
        },
        {
            id: "N2",
            user_id: "U_TEST_001",
            type: "booking_accepted",
            title: "Booking confirmed",
            message: "Your booking was confirmed.",
            is_read: 1,
            created_at: new Date(Date.now() - 90000000).toISOString()
        }
    ];

    // ── Tasks ─────────────────────────────────────────────────────────────────

    var TASKS = [
        {
            id: "T1",
            poster_id: "U_OTHER_001",
            poster_name: "Max Mustermann",
            title: "Help moving furniture",
            description: "Need help moving a sofa to the 3rd floor.",
            category: "Home",
            budget: 50,
            task_date: "2024-12-25",
            location: "Berlin Mitte",
            lat: 52.52,
            lng: 13.4,
            status: "open",
            application_count: 2,
            created_at: "2024-12-10T08:00:00.000Z"
        },
        {
            id: "T2",
            poster_id: "U_TEST_001",
            poster_name: "Julia Tester",
            title: "Garden cleanup needed",
            description: "Autumn leaves everywhere.",
            category: "Home",
            budget: 30,
            task_date: "2024-12-28",
            location: "Berlin Prenzlauer Berg",
            lat: 52.535,
            lng: 13.415,
            status: "open",
            application_count: 0,
            created_at: "2024-12-11T10:00:00.000Z"
        }
    ];

    // ── Conversations ─────────────────────────────────────────────────────────

    var CONVERSATIONS = [
        {
            id: "CONV1",
            other_id: "p1",
            other_name: "Sarah Martinez",
            other_avatar: "https://randomuser.me/api/portraits/women/65.jpg",
            last_message: "See you tomorrow!",
            last_message_at: new Date(Date.now() - 3600000).toISOString(),
            unread_count: 1
        }
    ];

    // ── Ratings ───────────────────────────────────────────────────────────────

    var RATINGS = [
        {
            id: 1,
            stars: 5,
            comment: "Excellent work, very professional!",
            reviewer_name: "Max T.",
            reviewer_avatar: "",
            status: "approved",
            created_at: new Date(Date.now() - 172800000).toISOString()
        },
        {
            id: 2,
            stars: 4,
            comment: "Good service, would recommend.",
            reviewer_name: "Julia P.",
            reviewer_avatar: "",
            status: "approved",
            created_at: new Date(Date.now() - 604800000).toISOString()
        }
    ];

    return {
        USER:                       USER,
        PROVIDER_USER:              PROVIDER_USER,
        PRO_PROVIDER_USER:          PRO_PROVIDER_USER,
        PROVIDERS:                  PROVIDERS,
        SERVICES:                   SERVICES,
        BOOKINGS:                   BOOKINGS,
        NOTIFICATIONS:              NOTIFICATIONS,
        TASKS:                      TASKS,
        CONVERSATIONS:              CONVERSATIONS,
        RATINGS:                    RATINGS,
        HOME_ACTIVITY:              HOME_ACTIVITY,
        SUBSCRIPTION_STATUS:        SUBSCRIPTION_STATUS,
        SUBSCRIPTION_STATUS_NEAR_CAP: SUBSCRIPTION_STATUS_NEAR_CAP,
        FEATURED_UNTIL:             FEATURED_UNTIL,
        ACCESS_TOKEN:               "mock-access-token-xyz",
        REFRESH_TOKEN:              "mock-refresh-token-abc"
    };
});
