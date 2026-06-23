from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field("", max_length=100)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str = Field(..., min_length=4, max_length=4)
    new_password: str = Field(..., min_length=8, max_length=128)


class PreferencesResponse(BaseModel):
    tts_speed: float = 1.0
    tts_accent: str = "us"
    dark_mode: bool = False


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    is_active: bool
    preferences: PreferencesResponse = Field(default_factory=PreferencesResponse)

    model_config = {"from_attributes": True}


class VerifyFirebaseTokenRequest(BaseModel):
    id_token: str
    full_name: str = ""


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=8, max_length=128)


class UpdateProfileRequest(BaseModel):
    full_name: str | None = Field(None, max_length=100)
    email: EmailStr | None = None


class UpdatePreferencesRequest(BaseModel):
    tts_speed: float | None = Field(None, ge=0.25, le=2.0)
    tts_accent: str | None = Field(None, pattern=r"^(us|uk)$")
    dark_mode: bool | None = None
