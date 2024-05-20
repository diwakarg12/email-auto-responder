import { Request, Response } from 'express';
import { oAuth2Client } from '../config/googleConfig';
import { google } from 'googleapis';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
];

export const googleAuthUrl = (req: Request, res: Response) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  res.redirect(authUrl);
};

export const googleAuthCallbacks = async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  res.send('Google Authentication successfully! You can close this tab');
};

export const getGoogleEmails = async (auth: any) => {
  const gmail = google.gmail({ version: 'v1', auth });
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: 'is:unread',
  });
  const messages = res.data.messages || [];
  return messages;
};
