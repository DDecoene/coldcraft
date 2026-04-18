import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    sha: process.env.GIT_SHA || 'unknown',
    builtAt: process.env.BUILD_AT || 'unknown',
    nodeEnv: process.env.NODE_ENV ?? 'unknown',
  });
}
