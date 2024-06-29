import { google } from 'googleapis';
import { OpenAI } from 'openai';
// import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';
import dotenv from 'dotenv';

dotenv.config();
const googleOAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// const outlookClient = Client.init({
//   authProvider: (done) => {
//     done(null, process.env.OUTLOOK_ACCESS_TOKEN);
//   },
// });

// const openai = new OpenAIApi(
//   new Configuration({ apiKey: process.env.OPENAI_API_KEY })
// );

// export { googleOAuth2Client, outlookClient, openai };
// export { googleOAuth2Client, openai };
export { googleOAuth2Client };
