import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../auth/decorators/current-user.decorator';
import { PracticeService } from './practice.service';

@ApiTags('Public Practice Tracks & Hub')
@Controller('practice')
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  @Public()
  @Get('dsa/daily-challenge')
  @ApiOperation({ summary: 'Get today\'s authoritative scheduled daily challenge' })
  getDailyChallenge(@CurrentUser() user?: AuthenticatedUser) {
    return this.practiceService.getTodayDailyChallenge(user?.id);
  }

  @Public()
  @Get('dsa/curated')
  @ApiOperation({ summary: 'Get the 10 curated problems for Today\'s Practice' })
  getCuratedPractice(@CurrentUser() user?: AuthenticatedUser) {
    return this.practiceService.getCuratedPractice(user?.id);
  }

  @Public()
  @Get('development/tracks')
  @ApiOperation({ summary: 'Get all active development tracks, projects, and modules' })
  getDevelopmentTracks() {
    return this.practiceService.getDevelopmentTracks();
  }

  @Public()
  @Get('system-design/topics')
  @ApiOperation({ summary: 'Get all system design topics and scenarios categorized' })
  getSystemDesignTopics() {
    return this.practiceService.getSystemDesignTopics();
  }

  @Public()
  @Get('core/subjects')
  @ApiOperation({ summary: 'Get all Core CS subjects (DBMS, OS, CN, OOPs) and interview questions' })
  getCoreSubjects() {
    return this.practiceService.getCoreSubjects();
  }
}

