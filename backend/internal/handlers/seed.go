package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type promptSeed struct {
	Text             string `json:"text"`
	Category         string `json:"category"`
	Difficulty       int    `json:"difficulty"`
	EstimatedSeconds int    `json:"estimatedSeconds"`
}

// POST /api/v1/admin/seed
// Seeds the prompts table. Idempotent — skips on conflict.
// No auth on this route — it's dev-only and should be removed before real production.
func SeedPrompts(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		prompts := getPromptSeedData()

		inserted := 0
		for _, p := range prompts {
			tag, err := pool.Exec(ctx, `
				INSERT INTO prompts (text, category, difficulty, estimated_seconds)
				VALUES ($1, $2, $3, $4)
				ON CONFLICT DO NOTHING
			`, p.Text, p.Category, p.Difficulty, p.EstimatedSeconds)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			inserted += int(tag.RowsAffected())
		}

		c.JSON(http.StatusOK, gin.H{
			"message":  "Seed complete",
			"inserted": inserted,
			"total":    len(prompts),
		})
	}
}

func getPromptSeedData() []promptSeed {
	return []promptSeed{
		// Persuasion
		{"Convince someone to try a food they've always refused to eat.", "persuasion", 1, 60},
		{"Persuade your team to adopt a 4-day work week.", "persuasion", 2, 60},
		{"Make the case for why everyone should learn a second language.", "persuasion", 1, 60},
		{"Convince a skeptic that a morning routine is worth building.", "persuasion", 1, 60},
		{"Pitch why your city deserves to host the next Olympics.", "persuasion", 2, 60},
		{"Argue that reading fiction is as valuable as reading non-fiction.", "persuasion", 1, 60},
		{"Persuade someone to give up social media for one month.", "persuasion", 2, 60},
		{"Make the case that failure is the best teacher.", "persuasion", 1, 60},
		{"Convince a company to invest in employee mental health programs.", "persuasion", 2, 60},
		{"Argue why space exploration is worth the investment.", "persuasion", 2, 60},
		{"Persuade someone that walking meetings are better than sitting ones.", "persuasion", 1, 60},
		{"Make the case for why everyone should learn basic coding.", "persuasion", 1, 60},
		{"Convince a friend to start journaling daily.", "persuasion", 1, 60},
		{"Argue that remote work is better for productivity than office work.", "persuasion", 2, 60},
		{"Persuade your audience that slow travel is better than rushing through destinations.", "persuasion", 1, 60},
		{"Convince someone that breakfast is the most important meal of the day.", "persuasion", 1, 60},
		{"Make the case that cities should ban cars from their centers.", "persuasion", 2, 60},
		{"Argue that curiosity is more valuable than intelligence.", "persuasion", 2, 60},
		{"Persuade someone to volunteer at least once a month.", "persuasion", 1, 60},
		{"Make the case that everyone should travel solo at least once.", "persuasion", 1, 60},
		// Storytelling
		{"Tell the story of a time you were completely lost — literally or figuratively.", "storytelling", 1, 60},
		{"Describe a moment when you changed your mind about something important.", "storytelling", 2, 60},
		{"Tell a story about the best advice you ever received.", "storytelling", 1, 60},
		{"Describe the moment you realized you were good at something.", "storytelling", 1, 60},
		{"Tell a story about a time things went wrong but turned out okay.", "storytelling", 1, 60},
		{"Describe a person who changed how you see the world.", "storytelling", 2, 60},
		{"Tell the story behind a scar, real or metaphorical.", "storytelling", 2, 60},
		{"Describe a place that feels like home and why.", "storytelling", 1, 60},
		{"Tell a story about a bet or risk that paid off.", "storytelling", 1, 60},
		{"Describe the best day you've had in the last year.", "storytelling", 1, 60},
		{"Tell a story about a friendship that surprised you.", "storytelling", 1, 60},
		{"Describe a decision you made that changed your path.", "storytelling", 2, 60},
		{"Tell the story of your most memorable meal.", "storytelling", 1, 60},
		{"Describe a time you had to start over from scratch.", "storytelling", 2, 60},
		{"Tell a story about something you built, created, or made with your hands.", "storytelling", 1, 60},
		{"Tell a story about a time you surprised yourself.", "storytelling", 1, 60},
		{"Describe the most interesting stranger you've ever met.", "storytelling", 1, 60},
		{"Tell a story about a time you had to ask for help.", "storytelling", 2, 60},
		{"Describe something you made as a child that you're still proud of.", "storytelling", 1, 60},
		{"Tell the story of how you got into your current field or hobby.", "storytelling", 1, 60},
		// Impromptu
		{"What's a small habit that has had an outsized impact on your life?", "impromptu", 1, 60},
		{"If you could fix one thing about how your city works, what would it be?", "impromptu", 1, 60},
		{"What's a popular opinion you actually disagree with?", "impromptu", 2, 60},
		{"What skill do you wish you had started learning earlier?", "impromptu", 1, 60},
		{"What's one thing most people misunderstand about your job or field?", "impromptu", 2, 60},
		{"If you had to teach something in 60 seconds, what would it be?", "impromptu", 1, 60},
		{"What's the most useful thing you learned outside of school?", "impromptu", 1, 60},
		{"What would you do with a completely free Saturday?", "impromptu", 1, 60},
		{"What's something you've changed your mind about in the last two years?", "impromptu", 2, 60},
		{"Describe your ideal working environment in as much detail as you can.", "impromptu", 1, 60},
		{"What's one thing you'd tell your 18-year-old self?", "impromptu", 1, 60},
		{"What does success mean to you right now?", "impromptu", 2, 60},
		{"What's a book, film, or podcast that genuinely changed how you think?", "impromptu", 1, 60},
		{"If you had to live in another country for a year, where and why?", "impromptu", 1, 60},
		{"What's something you do differently from most people you know?", "impromptu", 1, 60},
		{"What's the best piece of advice you've ever ignored?", "impromptu", 2, 60},
		{"What's one thing you wish your coworkers or classmates knew about you?", "impromptu", 2, 60},
		{"What's an unpopular hobby or interest of yours that you're proud of?", "impromptu", 1, 60},
		{"What's a question you've been thinking about a lot lately?", "impromptu", 2, 60},
		{"What would you do if you knew you couldn't fail?", "impromptu", 1, 60},
		// Interview
		{"Tell me about yourself in 60 seconds.", "interview", 1, 60},
		{"What's your greatest professional strength and give an example of it in action?", "interview", 2, 60},
		{"Describe a challenge you faced at work and how you overcame it.", "interview", 2, 60},
		{"Where do you see yourself in five years?", "interview", 1, 60},
		{"Why do you want to leave your current role?", "interview", 2, 60},
		{"Tell me about a time you disagreed with your manager and how you handled it.", "interview", 3, 60},
		{"What's a project you're most proud of and why?", "interview", 1, 60},
		{"Describe a time you had to learn something quickly under pressure.", "interview", 2, 60},
		{"How do you prioritize when you have too much to do?", "interview", 2, 60},
		{"Tell me about a time you received difficult feedback and what you did with it.", "interview", 2, 60},
		{"What makes you a strong candidate for this role?", "interview", 2, 60},
		{"Describe a time you took initiative without being asked.", "interview", 1, 60},
		{"How do you handle working with people who have a very different style than yours?", "interview", 2, 60},
		{"Tell me about a mistake you made and what you learned from it.", "interview", 2, 60},
		{"What's something you've taught yourself, and how did you go about it?", "interview", 1, 60},
		{"Walk me through your career story in 60 seconds.", "interview", 2, 60},
		{"Tell me about a time you had to make a decision with incomplete information.", "interview", 3, 60},
		{"Describe a time you helped a teammate who was struggling.", "interview", 1, 60},
		{"What's your approach to giving and receiving feedback?", "interview", 2, 60},
		{"Tell me about a time you had to adapt to a big change at work.", "interview", 2, 60},
	}
}
