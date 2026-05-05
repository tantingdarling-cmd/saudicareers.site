<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Illuminate\Cache\RateLimiter;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'device_name' => 'required|string|max:255',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['البيانات غير صحيحة'],
            ]);
        }

        $token = $user->createToken($request->device_name)->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل الدخول بنجاح',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل الخروج بنجاح',
        ]);
    }

    public function user(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);
    }

    // POST /api/v1/register — public user registration
    public function publicRegister(Request $request)
    {
        try {
            $request->validate([
                'name'                  => 'required|string|max:255',
                'email'                 => 'required|email|unique:users,email',
                'password'              => 'required|string|min:8|confirmed',
            ]);

            $otp = rand(100000, 999999);
            $expiresAt = Carbon::now()->addMinutes(15);

            $user = User::create([
                'name'     => $request->name,
                'email'    => $request->email,
                'password' => Hash::make($request->password),
                'role'     => 'user',
                'email_verification_code' => hash('sha256', $otp),
                'email_verification_expires_at' => $expiresAt,
            ]);

            // Send OTP via email using Markdown template
            try {
                Mail::to($user->email)->send(new \App\Mail\OtpVerificationMail($otp));
            } catch (\Exception $e) {
                Log::warning('Failed to send verification email to '.$user->email.': '.$e->getMessage());
            }

            return response()->json([
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'email_verified_at' => $user->email_verified_at,
                ],
                'token' => $user->createToken('app')->plainTextToken,
                'requires_verification' => true
            ]);
        } catch (\Exception $e) {
            Log::error('Register failed: '.$e->getMessage(), ['request'=>request()->all()]);
            return response()->json(['error' => 'Registration failed: ' . $e->getMessage()], 500);
        }
    }

    // POST /api/admin/register — admin-only: create admin accounts
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:12|confirmed|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'admin',
        ]);

        $token = $user->createToken('register')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء الحساب بنجاح',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'token' => $token,
        ], 201);
    }

    public function refreshToken(Request $request)
    {
        $user = $request->user();
        
        $request->user()->currentAccessToken()->delete();
        $token = $user->createToken('refresh')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
        ]);
    }
    public function verifyEmail(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();

        if ($user->email_verified_at) {
            return response()->json(['message' => 'البريد مفعّل بالفعل'], 200);
        }

        if (Carbon::now()->isAfter($user->email_verification_expires_at)) {
            return response()->json(['error' => 'انتهت صلاحية الكود'], 422);
        }

        if (hash('sha256', $request->code) !== $user->email_verification_code) {
            return response()->json(['error' => 'كود التفعيل غير صحيح'], 422);
        }

        $user->update([
            'email_verified_at' => Carbon::now(),
            'email_verification_code' => null,
            'email_verification_expires_at' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تفعيل البريد بنجاح',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
            ]
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        // Always return success to avoid user enumeration
        if (!$user) {
            return response()->json(['message' => 'إذا كان البريد مسجلاً، ستصلك رسالة بالرمز']);
        }

        $otp = rand(100000, 999999);
        $expiresAt = Carbon::now()->addMinutes(15);

        $user->update([
            'password_reset_code' => hash('sha256', $otp),
            'password_reset_expires_at' => $expiresAt,
        ]);

        try {
            Mail::to($user->email)->send(new \App\Mail\PasswordResetMail($otp));
        } catch (\Exception $e) {
            Log::warning('Failed to send password reset email to '.$user->email.': '.$e->getMessage());
            return response()->json(['error' => 'فشل إرسال البريد، حاول مجدداً'], 500);
        }

        return response()->json(['message' => 'إذا كان البريد مسجلاً، ستصلك رسالة بالرمز']);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email'                 => 'required|email',
            'code'                  => 'required|string|size:6',
            'password'              => 'required|string|min:8|confirmed',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !$user->password_reset_code) {
            return response()->json(['error' => 'الرمز غير صحيح أو منتهي الصلاحية'], 422);
        }

        if (Carbon::now()->isAfter($user->password_reset_expires_at)) {
            return response()->json(['error' => 'انتهت صلاحية الرمز'], 422);
        }

        if (hash('sha256', $request->code) !== $user->password_reset_code) {
            return response()->json(['error' => 'الرمز غير صحيح'], 422);
        }

        $user->update([
            'password' => Hash::make($request->password),
            'password_reset_code' => null,
            'password_reset_expires_at' => null,
        ]);

        return response()->json(['success' => true, 'message' => 'تم تغيير كلمة المرور بنجاح']);
    }

    public function resendOtp(Request $request)
    {
        $user = $request->user();

        if ($user->email_verified_at) {
            return response()->json(['message' => 'البريد مفعّل بالفعل'], 200);
        }

        $otp = rand(100000, 999999);
        $expiresAt = Carbon::now()->addMinutes(15);

        $user->update([
            'email_verification_code' => hash('sha256', $otp),
            'email_verification_expires_at' => $expiresAt,
        ]);

        try {
            Mail::to($user->email)->send(new \App\Mail\OtpVerificationMail($otp));
        } catch (\Exception $e) {
            return response()->json(['error' => 'فشل إرسال البريد'], 500);
        }

        return response()->json(['message' => 'تم إعادة إرسال الكود بنجاح']);
    }
}
