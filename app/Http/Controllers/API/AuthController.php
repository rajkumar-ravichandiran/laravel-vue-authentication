<?php

namespace App\Http\Controllers\API;

use App\Models\Otp;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Notifications\VerifyOtp;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Crypt;
use App\Notifications\AccountVerified;
use Illuminate\Support\Facades\Notification;
use App\Notifications\UserRegistrationNotification;

class AuthController extends Controller
{
    private function sendOTP($user, $email){
        $otp = str_pad(random_int(0,999999), 6, '0', STR_PAD_LEFT);

        Otp::updateOrCreate(
            ['email'=> $email],
            ['otp' => Hash::make($otp), 'expires_at' => now()->addMinutes(5)]
        );
        $user->notify(new VerifyOtp($otp));
    }

    private function otpVerification($email, $otp, $isRegistration = false){
        $user = User::where('email',$email)->first();
        if(!$user){
            return ['status'=>false, 'msg'=>'User not found', 'code'=> 404];
        }

        $otpData = Otp::where('email',$email)->first();

        if(!$otpData || !Hash::check($otp, $otpData->otp) || $otpData->expires_at < now()){
            return ['status'=>false, 'msg'=>'Invalid or Expired OTP', 'code' => 400];
        }

        if($isRegistration){
            $user->email_verified_at = now();
            $user->update();

            $user->notify(new AccountVerified());
        }

        return ['status'=>true, 'msg'=>'OTP verified successfully!','code' => 200];
    }

    public function register(Request $request){

        $request->validate([
            'name'      => 'required|string|max:255',
            'email'     => 'required|string|email|max:255|unique:users',
            'password'  => 'required|string|confirmed'
        ]);

        $user = User::create([
            'name'     =>  strip_tags($request->name),
            'email'    =>  strip_tags($request->email),
            'password' =>  Hash::make($request->password),
        ]);

        $user->notify(new UserRegistrationNotification());
        $this->sendOTP($user, $user->email);
        return response()->json(['status'=>true,'msg'=>'Registration Successfull, OTP sent to Email'],200);
    }

    public function login(Request $request){

        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email',strip_tags($request->email))->first();

        if(!$user) return response()->json(['status'=>false, 'msg'=>'User not found'],400);

        if($user && $user->email_verified_at == NULL) return response()->json(['status'=>false,'msg'=>'User not Verified'], 403);

        if(!Auth::attempt($request->only('email', 'password'))) return response()->json(['status'=>false,'msg' => 'Invalid Password or Email'], 401);

        return response()->json(['status'=>true,'msg'=>'LoggedIn Successfull'],200);

    }

    public function logout(Request $request){
        if (auth()->check()) {
            request()->session()->invalidate();
            request()->session()->regenerateToken();
        }
        return response()->json(['status'=>true,'msg' => 'Logged out']);
    }

    public function sendOtPtoUser(Request $request){
        $request->validate([
            'email'=>'required|email'
        ]);

        $user = User::where('email',strip_tags($request->email))->first();

        if(!$user){
            return response()->json(['status'=>false, 'msg'=>'User not found'],400);
        }

        $this->sendOTP($user, strip_tags($request->email));

        return response()->json(['status'=>true, 'msg' => 'OTP sent to your email']);
    }

    public function verifyOtp(Request $request){
        $request->validate([
            'email' => 'required|email',
            'otp'   => 'required'
        ]);

        $data = $this->otpVerification(strip_tags($request->email), strip_tags($request->otp));
        $code = $data['code'];
        unset($data['code']);
        return response()->json($data, $code);
    }

    public function resetPassword(Request $request){
        $request->validate([
            'email' => 'required|email',
            'password'  => 'required|string|confirmed'
        ]);

        $user = User::where('email',strip_tags($request->email))->first();

        if(!$user){
            return response()->json(['status'=>false, 'msg'=>'User not found'],400);
        }
        $user->update(['password'=>Hash::make(strip_tags($request->password))]);

        return response()->json(['status'=>true, 'msg'=>'Password Updated successfully!']);
    }

    public function verifyUser(Request $request){
        $request->validate([
            'email' => 'required|email',
            'otp'   => 'required'
        ]);

        $data = $this->otpVerification(strip_tags($request->email), strip_tags($request->otp), true);
        $code = $data['code'];
        unset($data['code']);

        return response()->json($data, $code);
    }

    public function getUser(Request $request){
        $user = auth() ? auth()->user() : NULL;
        if(!$user) return response()->json(['status'=>false,'msg'=>'User not found'], 404);
        $data = ['user'=>$user->name, 'token'=> Crypt::encrypt($user->id)];
        return response()->json(['status'=>true, 'data'=>$data],200);
    }
}