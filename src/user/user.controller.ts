import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListUserDto } from './dto/list-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { GetUserId } from 'src/auth/decorators/get-user.decorator';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get user by id' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200, description: 'User found', type: ListUserDto })
  async getUser(@GetUserId() id: string): Promise<ListUserDto> {
    if (!id) throw new NotFoundException('User not found');
    const user = await this.userService.getUser(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200, description: 'User updated', type: ListUserDto })
  async updateUser(
    @GetUserId() id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<ListUserDto | null> {
    if (!id) throw new NotFoundException('User not found');
    return this.userService.updateUser(id, dto);
  }
}
