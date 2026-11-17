let QUESTS = [
  {
    id: "p1",
    tier: "paid",
    title: "Campus Library Shelver",
    org: "University Library",
    description: "Sort and re-shelve returned books for a few hours.",
    payout: 180,
    xp: 120,
    time_hours: 4,
    location: "on-campus"
  },
  {
    id: "p2",
    tier: "paid",
    title: "Remote Data Entry",
    org: "Local Small Business",
    description: "Clean and organize a spreadsheet from home.",
    payout: 250,
    xp: 100,
    time_hours: 5,
    location: "remote"
  },
  {
    id: "f1",
    tier: "free",
    title: "Community Garden Volunteer Day",
    org: "Neighborhood Green Initiative",
    description: "Plant and care for the community garden with local volunteers.",
    payout: 0,
    xp: 70,
    time_hours: 3,
    location: "local"
  },
  {
    id: "f2",
    tier: "free",
    title: "Public Speaking Workshop",
    org: "Student Union",
    description: "Join a free workshop on structuring talks and calming nerves.",
    payout: 0,
    xp: 60,
    time_hours: 2,
    location: "on-campus"
  },
  {
    id: "pr1",
    tier: "premium",
    title: "Weekend UX Design Bootcamp",
    org: "XP Skill Academy",
    description: "Build a portfolio-ready case study during this two-day bootcamp.",
    cost: 450,
    xp: 400,
    time_hours: 16,
    location: "on-campus"
  },
  {
    id: "pr2",
    tier: "premium",
    title: "Analytics Certification Prep",
    org: "XP Skill Academy",
    description: "Prepare for an analytics certification with a guided online course.",
    cost: 300,
    xp: 350,
    time_hours: 10,
    location: "remote"
  }
];

const TIER_LABELS = { paid: "Paid", free: "Free", premium: "Premium" };
