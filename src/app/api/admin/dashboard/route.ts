import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { UserModel } from "@/models/User";
import { ContentLogModel } from "@/models/ContentLog";
import { FacebookPostModel } from "@/models/FacebookPost";
import { TikTokPostModel } from "@/models/TikTokPost";
import { withAuth } from "@/lib/api-utils";

export const GET = withAuth(async (req) => {
  await connectDB();

  const [
    totalUsers,
    verifiedUsers,
    activeUsers,
    adminUsers,
    totalPosts,
    totalContentLogs,
    postedContentLogs,
    recentLogs,
    recentUsers,
  ] = await Promise.all([
    UserModel.countDocuments(),
    UserModel.countDocuments({ emailVerified: true }),
    UserModel.countDocuments({ isActive: true }),
    UserModel.countDocuments({ role: "admin" }),
    FacebookPostModel.countDocuments(),
    ContentLogModel.countDocuments(),
    ContentLogModel.countDocuments({ posted: true }),
    ContentLogModel.find().sort({ created_at: -1 }).limit(5).lean(),
    UserModel.find().sort({ createdAt: -1 }).limit(5).select("-password").lean(),
  ]);

  // Monthly post stats for chart
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const monthlyContentLogs = await ContentLogModel.find({
    created_at: { $gte: thirtyDaysAgo },
  }).sort({ created_at: 1 }).lean();

  const dailyStats: Record<string, number> = {};
  monthlyContentLogs.forEach((log) => {
    const day = new Date(log.created_at).toISOString().slice(0, 10);
    dailyStats[day] = (dailyStats[day] || 0) + 1;
  });

  const chartData = Object.entries(dailyStats)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({
    stats: {
      totalUsers,
      verifiedUsers,
      activeUsers,
      adminUsers,
      totalPosts,
      totalContentLogs,
      postedContentLogs,
    },
    chartData,
    recentLogs,
    recentUsers,
  });
}, { adminOnly: true });
