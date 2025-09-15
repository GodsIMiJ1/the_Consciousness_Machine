# OpenAI API Setup Guide

Your AURA-BREE app has been updated to use OpenAI directly from the frontend, bypassing Supabase Edge Functions.

## Quick Setup

1. **Get your OpenAI API Key**
   - Go to https://platform.openai.com/api-keys
   - Create a new API key
   - Copy the key (it starts with `sk-`)

2. **Add the API Key to your .env file**
   - Open the `.env` file in your project root
   - Replace `your_openai_api_key_here` with your actual API key:
   ```
   VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. **Restart your development server**
   ```bash
   npm run dev
   ```

## What Changed

- ✅ **Direct OpenAI Integration**: No more Supabase Edge Functions dependency
- ✅ **Frontend API Calls**: All AI features now work directly from the browser
- ✅ **Same Features**: Chat, Horoscope, Dream Interpretation, and Tarot readings
- ✅ **Better Error Handling**: Clear messages when API key is missing
- ✅ **Faster Setup**: Just add your API key and you're ready!

## Features That Work

- **Chat with AURA-BREE**: Therapeutic companion conversations
- **Daily Horoscopes**: Personalized astrological guidance
- **Dream Interpretation**: Symbolic dream analysis
- **Tarot Readings**: 3-card Past/Present/Future spreads

## Security Note

The API key is exposed in the frontend, which is normal for client-side applications. OpenAI provides usage limits and monitoring to prevent abuse. For production apps, consider implementing a backend proxy for additional security.

## Troubleshooting

- **"OpenAI API key is not configured"**: Make sure your `.env` file has `VITE_OPENAI_API_KEY` set
- **API errors**: Check your OpenAI account has credits and the API key is valid
- **CORS errors**: This shouldn't happen with OpenAI's API, but restart your dev server if you see any

## Cost Management

- The app uses `gpt-4o-mini` model which is very cost-effective
- Typical usage costs are minimal (fractions of a penny per conversation)
- Monitor usage at https://platform.openai.com/usage

Your app is now ready to use with direct OpenAI integration! 🎉
