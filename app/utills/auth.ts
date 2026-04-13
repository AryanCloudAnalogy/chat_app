import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function verifyAuthToken(request: Request) {
  const cookieHeader = request.headers.get('cookie');
  const cookie = Object.fromEntries(
    cookieHeader?.split('; ').map((c) => c.split('=')) || []
  );

  const accesstoken = cookie['accessToken'];
  const refreshToken = cookie['refreshToken'];

  if (!accesstoken && !refreshToken) {
    throw new Error('No token provided');
  }
  if(!accesstoken && refreshToken){
    const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_SECRET as string) as any;
    const newAccessToken = jwt.sign(
      { uid: decodedRefresh.uid, email: decodedRefresh.email, name: decodedRefresh.name },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" }
    );
    const cookieStore = await cookies();
    cookieStore.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    });
    request.headers.set('cookie', `${cookieHeader}; accessToken=${newAccessToken}`);
    return verifyAuthToken(request);
  }

  try {
    const decoded = jwt.verify(accesstoken, process.env.JWT_SECRET as string) as any;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}
