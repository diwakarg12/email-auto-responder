import { Request, response, Response } from 'express';
import { pca } from '../config/outlookConfig';
import { Client } from '@microsoft/microsoft-graph-client';

const SCOPES = ['Mail.Read', 'Mail.Send'];

export const outlookAuthUrl = (req: Request, res: Response) => {
  const authCodeUrlParameters = {
    scopes: SCOPES,
    redirectUri: 'http://localhost:3000/auth/outlook/callback',
  };

  pca.getAuthCodeUrl(authCodeUrlParameters).then((response: any) => {
    res.redirect(response);
  });
};
export const outlookAuthCallback = async (req: Request, res: Response) => {
  const tokenRequest = {
    code: req.query.code as string,
    scopes: SCOPES,
    redirectUri: 'http://localhost:3000/auth/outlook/callback',
  };

  const response = await pca.acquireTokenByCode(tokenRequest);
  res.send('Outlook Authentication successfully! You can close this tab.');
};

export const getOutlookEmails = async (auth: any) => {
  const client = Client.init({
    authProvider: (done) => {
      done(null, auth.accessToken);
    },
  });

  try {
    const res = await client
      .api('/me/mailFolders/inbox/messages')
      .top(10)
      .select('subject,bodyPreview,sender,from,receivedDateTime')
      .filter('IsRead eq false')
      .orderby('receivedDateTimes DESC')
      .get();

    return res.value;
  } catch (error) {
    console.log(error);
    throw new Error('Error fetching Outlook emails');
  }
};
