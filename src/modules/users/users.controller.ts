import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { JwtPayload } from '../auth/auth.service';

@ApiTags('User Management')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Store Admin', 'Store Manager')
  @ApiOperation({ summary: 'List all staff and customer users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Return all users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('audit-logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Store Admin', 'Store Manager')
  @ApiOperation({ summary: 'Get security and user activity audit logs (Admin only)' })
  getAuditLogs() {
    return this.usersService.getAuditLogs();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user details by ID' })
  @ApiParam({ name: 'id', description: 'User identifier' })
  findOne(@Param('id') id: string, @Request() req: { user: JwtPayload }) {
    // Normal customers can only access their own profile; admins can access any
    const isAdmin = ['Super Admin', 'Store Admin', 'Store Manager', 'Support Agent'].includes(req.user.role);
    if (!isAdmin && req.user.sub !== id) {
      throw new ForbiddenException('You can only view your own user profile.');
    }
    return this.usersService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Store Admin', 'Store Manager')
  @ApiOperation({ summary: 'Create or invite a new staff or customer account (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user profile or role' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @Request() req: { user: JwtPayload }) {
    const isAdmin = ['Super Admin', 'Store Admin', 'Store Manager'].includes(req.user.role);
    // Non-admins can only update their own profile and cannot elevate their role or status
    if (!isAdmin) {
      if (req.user.sub !== id) {
        throw new ForbiddenException('You can only update your own account.');
      }
      delete dto.role;
      delete dto.status;
    }
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Store Admin')
  @ApiOperation({ summary: 'Remove a user or staff member (Admin only)' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
