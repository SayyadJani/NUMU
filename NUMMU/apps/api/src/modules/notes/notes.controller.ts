import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, type AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@ApiTags('Notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  @ApiOperation({ summary: 'List authenticated user notes with optional filters' })
  @ApiQuery({ name: 'category', required: false, example: 'dsa' })
  @ApiQuery({ name: 'search', required: false, example: 'sliding window' })
  @ApiQuery({ name: 'tag', required: false, example: 'Graph' })
  @ApiResponse({ status: 200, description: 'List of personal notes' })
  getNotes(
    @CurrentUser() user: AuthenticatedUser,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('tag') tag?: string,
  ) {
    return this.notesService.getNotes(user.id, { category, search, tag });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get note by ID' })
  @ApiResponse({ status: 200, description: 'Note details' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  getNoteById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.notesService.getNoteById(user.id, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new study note' })
  @ApiResponse({ status: 201, description: 'Note created successfully' })
  createNote(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateNoteDto,
  ) {
    return this.notesService.createNote(user.id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing study note' })
  @ApiResponse({ status: 200, description: 'Note updated successfully' })
  updateNote(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.notesService.updateNote(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a study note' })
  @ApiResponse({ status: 200, description: 'Note deleted' })
  deleteNote(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.notesService.deleteNote(user.id, id);
  }

  @Patch(':id/pin')
  @ApiOperation({ summary: 'Toggle pinned status of a study note' })
  @ApiResponse({ status: 200, description: 'Note pin status toggled' })
  togglePin(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.notesService.togglePin(user.id, id);
  }
}
