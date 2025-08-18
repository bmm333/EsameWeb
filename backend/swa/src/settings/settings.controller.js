import { Get } from "../../../../../../home/codespace/.cache/typescript/5.9/node_modules/@sinclair/typebox/build/cjs/type/registry/format";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";


@Controller('settings')
@Dependencies(SettingService)
export class SettingsController{
    constructor(settingsService)
    {this.settingsService=settingsService;}
    @UseGuards(JwtAuthGuard)
    @Get()
    @Bind(Request())
    async getSettings(req)
    {
        return this.settingsService.getUserSettings(req.user.id||req.user.userId);
    }
    @UseGuards(JwtAuthGuard)
    @Put()
    @Bind(Request(), Body())
    async updateSettings(req, settingsDto) {
        return this.settingsService.updateUserSettings(req.user.id || req.user.userId, settingsDto);
    }
    @UseGuards(JwtAuthGuard)
    @Delete()
    @Bind(Request())
    async deleteAccount(req) {
        return this.settingsService.deleteUserAccount(req.user.id || req.user.userId);
    }
}
