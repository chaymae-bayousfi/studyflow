import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SessionsModule } from './sessions/sessions.module';
import { SubjectsModule } from './subjects/subjects.module';
import { GroupsModule } from './groups/groups.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AvailabilitiesModule } from './availabilities/availabilities.module';
import { WeeklySchedulesModule } from './weekly-schedules/weekly-schedules.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { ScheduleModule } from '@nestjs/schedule';
import { RemindersModule } from './reminders/reminders.module';
import { SubjectGoalsModule } from './subject-goals/subject-goals.module';
import { SessionCommentsModule } from './session-comments/session-comments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    
    PrismaModule,
    AuthModule,
    UsersModule,
    SessionsModule,
    SubjectsModule,
    GroupsModule,
    NotificationsModule,
    AnalyticsModule,
    AvailabilitiesModule,
    WeeklySchedulesModule,
    LeaderboardModule,
    RemindersModule,
    SubjectGoalsModule,
    SessionCommentsModule,
  ],
})
export class AppModule {}