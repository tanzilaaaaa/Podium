/**
 * Run this once to seed Firestore with prompts and badges.
 * Call seedDatabase() from a one-time admin page or browser console.
 */
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore'
import { db } from './firebase'

export const PROMPTS = [
  // ── Persuasion ────────────────────────────────────────────────────────────
  { text: "Convince someone to try a food they've always refused to eat.", category: 'persuasion', difficulty: 1, estimatedSeconds: 60 },
  { text: 'Persuade your team to adopt a 4-day work week.', category: 'persuasion', difficulty: 2, estimatedSeconds: 60 },
  { text: 'Make the case for why everyone should learn a second language.', category: 'persuasion', difficulty: 1, estimatedSeconds: 60 },
  { text: 'Convince a skeptic that a morning routine is worth building.', category: 'persuasion', difficulty: 1, estimatedSeconds: 60 },
  { text: 'Pitch why your city deserves to host the next Olympics.', category: 'persuasion', difficulty: 2, estimatedSeconds: 60 },
  { text: 'Argue that reading fiction is as valuable as reading non-fiction.', category: 'persuasion', difficulty: 1, estimatedSeconds: 60 },
  { text: 'Persuade someone to give up social media for one month.', category: 'persuasion', difficulty: 2, estimatedSeconds: 60 },
  { text: 'Make the case that failure is the best teacher.', category: 'persuasion', difficulty: 1, estimatedSeconds: 60 },
  { text: 'Convince a company to invest in employee mental health programs.', category: 'persuasion', difficulty: 2, estimatedSeconds: 60 },
  { text: 'Argue why space exploration is worth the investment.', category: 'persuasion', difficulty: 2, estimatedSeconds: 60 },
  { text: 'Persuade someone that walking meetings are better than sitting ones.', category: 'persuasion', difficulty: 1, estimatedSeconds: 60 },
  { text: 'Make the case for why everyone should learn basic coding.', category: 'persuasion', difficulty: 1, estimatedSeconds: 60 },
  { text: 'Convince a friend to start journaling daily.', category: 'persuasion', difficulty: 1, estimatedSeconds: 60 },
  { text: 'Argue that remote work is better for productivity than office work.', category: 'persuasion', difficulty: 2, estimatedSeconds: 60 },
  { text: 'Persuade your audience that slow travel is better than rushing through destinations.', category: 'persuasion', difficulty: 1, estimatedSeconds: 60 },

  // ── Storytelling ──────────────────────────────────────────────────────────
  { text: 'Tell the story of a time you were completely lost — literally or figuratively.', category: 'storytelling', difficulty: 1, estimatedSeconds: 60 },
  { text: 'Describe a moment when you changed your mind about something important.', category: 'storytelling', difficulty: 2, estimatedSeconds: 60 },
  { text: 'Tell a story about the best advice you ever received.', category: 'storytelling', difficulty: 1, estimatedSeconds: 60 },
  { text: 'Describe the moment you realized you were good at something.', category: 'storytelling', difficulty: 1, estimatedSeconds: 60 },
  { text: 'Tell a story about a time things went wrong but turned out okay.', category: 'storytelling', difficulty: 1, estimatedSeconds: 60 },
  { text: 'Describe a person who changed how you see the world.', category: 'storytelling', difficulty: 2, estimatedSeconds: 60 },
  { text: 'Tell the story behind a scar, real or metaphorical.', category: 'storytelling', difficulty: 2, estimatedSeconds: 60 },
  { text: 'Describe a place that feels like home and why.', category: 'storytelling', difficulty: 1, estimatedSeconds: 60 },
  { text: 'Tell a story about a bet or risk that paid off.', category: 'storytelling', difficulty: 1, estimatedSeconds: 60 },
  { text: "Describe the best day you've had in the last year.", category: 'storytelling', difficulty: 1, estimatedSeconds: 60 },
  { text: 'Tell a story about a friendship that surprised you.', category: 'storytelling', difficulty: 1, estimatedSeconds: 60 },
  { text: 'Describe a decision you made that changed your path.', category: 'storytelling', difficulty: 2, estimatedSeconds: 60 },
  { text: 'Tell the story of your most memorable meal.', category: 'storytelling', difficulty: 1, estimatedSeconds: 60 },
  { text: 'Describe a time you had to start over from scratch.', category: 'storytelling', difficulty: 2, estimatedSeconds: 60 },
  { text: 'Tell a story about something you built, created, or made with your hands.', category: 'storytelling', difficulty: 1, estimatedSeconds: 60 },

  // ── Impromptu ─────────────────────────────────────────────────────────────
  { text: "What's a small habit that has had an outsized impact on your life?", category: 'impromptu', difficulty: 1, estimatedSeconds: 60 },
  { text: 'If you could fix one thing about how your city works, what would it be?', category: 'impromptu', difficulty: 1, estimatedSeconds: 60 },
  { text: "What's a popular opinion you actually disagree with?", category: 'impromptu', difficulty: 2, estimatedSeconds: 60 },
  { text: 'What skill do you wish you had started learning earlier?', category: 'impromptu', difficulty: 1, estimatedSeconds: 60 },
  { text: "What's one thing most people misunderstand about your job or field?", category: 'impromptu', difficulty: 2, estimatedSeconds: 60 },
  { text: 'If you had to teach something in 60 seconds, what would it be?', category: 'impromptu', difficulty: 1, estimatedSeconds: 60 },
  { text: "What's the most useful thing you learned outside of school?", category: 'impromptu', difficulty: 1, estimatedSeconds: 60 },
  { text: 'What would you do with a completely free Saturday?', category: 'impromptu', difficulty: 1, estimatedSeconds: 60 },
  { text: "What's something you've changed your mind about in the last two years?", category: 'impromptu', difficulty: 2, estimatedSeconds: 60 },
  { text: 'Describe your ideal working environment in as much detail as you can.', category: 'impromptu', difficulty: 1, estimatedSeconds: 60 },
  { text: "What's one thing you'd tell your 18-year-old self?", category: 'impromptu', difficulty: 1, estimatedSeconds: 60 },
  { text: 'What does "success" mean to you right now?', category: 'impromptu', difficulty: 2, estimatedSeconds: 60 },
  { text: "What's a book, film, or podcast that genuinely changed how you think?", category: 'impromptu', difficulty: 1, estimatedSeconds: 60 },
  { text: 'If you had to live in another country for a year, where and why?', category: 'impromptu', difficulty: 1, estimatedSeconds: 60 },
  { text: "What's something you do differently from most people you know?", category: 'impromptu', difficulty: 1, estimatedSeconds: 60 },

  // ── Interview ─────────────────────────────────────────────────────────────
  { text: 'Tell me about yourself in 60 seconds.', category: 'interview', difficulty: 1, estimatedSeconds: 60 },
  { text: "What's your greatest professional strength and give an example of it in action?", category: 'interview', difficulty: 2, estimatedSeconds: 60 },
  { text: 'Describe a challenge you faced at work and how you overcame it.', category: 'interview', difficulty: 2, estimatedSeconds: 60 },
  { text: 'Where do you see yourself in five years?', category: 'interview', difficulty: 1, estimatedSeconds: 60 },
  { text: 'Why do you want to leave your current role?', category: 'interview', difficulty: 2, estimatedSeconds: 60 },
  { text: 'Tell me about a time you disagreed with your manager and how you handled it.', category: 'interview', difficulty: 3, estimatedSeconds: 60 },
  { text: "What's a project you're most proud of and why?", category: 'interview', difficulty: 1, estimatedSeconds: 60 },
  { text: 'Describe a time you had to learn something quickly under pressure.', category: 'interview', difficulty: 2, estimatedSeconds: 60 },
  { text: 'How do you prioritize when you have too much to do?', category: 'interview', difficulty: 2, estimatedSeconds: 60 },
  { text: 'Tell me about a time you received difficult feedback and what you did with it.', category: 'interview', difficulty: 2, estimatedSeconds: 60 },
  { text: 'What makes you a strong candidate for this role?', category: 'interview', difficulty: 2, estimatedSeconds: 60 },
  { text: 'Describe a time you took initiative without being asked.', category: 'interview', difficulty: 1, estimatedSeconds: 60 },
  { text: 'How do you handle working with people who have a very different style than yours?', category: 'interview', difficulty: 2, estimatedSeconds: 60 },
  { text: 'Tell me about a mistake you made and what you learned from it.', category: 'interview', difficulty: 2, estimatedSeconds: 60 },
  { text: "What's something you've taught yourself, and how did you go about it?", category: 'interview', difficulty: 1, estimatedSeconds: 60 },
  { text: 'Walk me through your career story in 60 seconds.', category: 'interview', difficulty: 2, estimatedSeconds: 60 },
  { text: 'Tell me about a time you had to make a decision with incomplete information.', category: 'interview', difficulty: 3, estimatedSeconds: 60 },
  { text: 'Describe a time you helped a teammate who was struggling.', category: 'interview', difficulty: 1, estimatedSeconds: 60 },
  { text: "What's your approach to giving and receiving feedback?", category: 'interview', difficulty: 2, estimatedSeconds: 60 },
  { text: 'Tell me about a time you had to adapt to a big change at work.', category: 'interview', difficulty: 2, estimatedSeconds: 60 },

  // ── More Persuasion ───────────────────────────────────────────────────────
  { text: 'Convince someone that breakfast is the most important meal of the day.', category: 'persuasion', difficulty: 1, estimatedSeconds: 60 },
  { text: 'Make the case that cities should ban cars from their centers.', category: 'persuasion', difficulty: 2, estimatedSeconds: 60 },
  { text: 'Argue that curiosity is more valuable than intelligence.', category: 'persuasion', difficulty: 2, estimatedSeconds: 60 },
  { text: 'Persuade someone to volunteer at least once a month.', category: 'persuasion', difficulty: 1, estimatedSeconds: 60 },
  { text: 'Make the case that everyone should travel solo at least once.', category: 'persuasion', difficulty: 1, estimatedSeconds: 60 },

  // ── More Storytelling ─────────────────────────────────────────────────────
  { text: 'Tell a story about a time you surprised yourself.', category: 'storytelling', difficulty: 1, estimatedSeconds: 60 },
  { text: "Describe the most interesting stranger you've ever met.", category: 'storytelling', difficulty: 1, estimatedSeconds: 60 },
  { text: 'Tell a story about a time you had to ask for help.', category: 'storytelling', difficulty: 2, estimatedSeconds: 60 },
  { text: "Describe something you made as a child that you're still proud of.", category: 'storytelling', difficulty: 1, estimatedSeconds: 60 },
  { text: 'Tell the story of how you got into your current field or hobby.', category: 'storytelling', difficulty: 1, estimatedSeconds: 60 },

  // ── More Impromptu ────────────────────────────────────────────────────────
  { text: "What's the best piece of advice you've ever ignored?", category: 'impromptu', difficulty: 2, estimatedSeconds: 60 },
  { text: "What's one thing you wish your coworkers or classmates knew about you?", category: 'impromptu', difficulty: 2, estimatedSeconds: 60 },
  { text: "What's an unpopular hobby or interest of yours that you're proud of?", category: 'impromptu', difficulty: 1, estimatedSeconds: 60 },
  { text: "What's a question you've been thinking about a lot lately?", category: 'impromptu', difficulty: 2, estimatedSeconds: 60 },
  { text: "What would you do if you knew you couldn't fail?", category: 'impromptu', difficulty: 1, estimatedSeconds: 60 },
]

export const BADGES = [
  {
    id: 'first_rep',
    name: 'First Step',
    description: 'Complete your very first rep.',
    emoji: '🎤',
    criteria: { type: 'rep_count', threshold: 1 },
  },
  {
    id: 'zero_fillers',
    name: 'Clean Delivery',
    description: 'Complete a rep with zero filler words.',
    emoji: '✨',
    criteria: { type: 'zero_fillers', threshold: 1 },
  },
  {
    id: 'streak_3',
    name: 'On a Roll',
    description: 'Maintain a 3-day streak.',
    emoji: '🔥',
    criteria: { type: 'streak', threshold: 3 },
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak.',
    emoji: '⚡',
    criteria: { type: 'streak', threshold: 7 },
  },
  {
    id: 'streak_30',
    name: 'Unstoppable',
    description: 'Maintain a 30-day streak.',
    emoji: '🏆',
    criteria: { type: 'streak', threshold: 30 },
  },
  {
    id: 'rep_10',
    name: 'Getting Reps In',
    description: 'Complete 10 reps.',
    emoji: '💪',
    criteria: { type: 'rep_count', threshold: 10 },
  },
  {
    id: 'rep_50',
    name: 'Dedicated',
    description: 'Complete 50 reps.',
    emoji: '🌟',
    criteria: { type: 'rep_count', threshold: 50 },
  },
  {
    id: 'perfect_pace',
    name: 'Perfect Pace',
    description: 'Score 100 on pace.',
    emoji: '🎯',
    criteria: { type: 'pace_score', threshold: 100 },
  },
  {
    id: 'category_persuasion',
    name: 'Persuader',
    description: 'Complete 5 persuasion prompts.',
    emoji: '🗣️',
    criteria: { type: 'category_count', category: 'persuasion', threshold: 5 },
  },
  {
    id: 'category_storytelling',
    name: 'Storyteller',
    description: 'Complete 5 storytelling prompts.',
    emoji: '📖',
    criteria: { type: 'category_count', category: 'storytelling', threshold: 5 },
  },
  {
    id: 'category_interview',
    name: 'Interview Ready',
    description: 'Complete 5 interview prompts.',
    emoji: '💼',
    criteria: { type: 'category_count', category: 'interview', threshold: 5 },
  },
]

/**
 * Seed Firestore with prompts and badges.
 * Safe to run multiple times — uses set with merge.
 */
export async function seedDatabase() {
  const batch = writeBatch(db)

  for (const [i, prompt] of PROMPTS.entries()) {
    const ref = doc(collection(db, 'prompts'))
    batch.set(ref, prompt)
  }

  for (const badge of BADGES) {
    const ref = doc(db, 'badges', badge.id)
    batch.set(ref, badge)
  }

  await batch.commit()
  console.log(`✅ Seeded ${PROMPTS.length} prompts and ${BADGES.length} badges`)
}
