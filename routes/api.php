<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/
Route::middleware('web')->group(function () {
    Route::get('/config', function(){
        return response()->json(config('vue'));
    });
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('/user', [AuthController::class,'getUser']);
        Route::post('/logout',[AuthController::class,'logout']);
    });
    Route::post('/register',[AuthController::class,'register']);
    Route::post('/login',[AuthController::class,'login']);
    Route::post('/reset-password',[AuthController::class,'resetPassword']);
    Route::post('/send-otp',[AuthController::class,'sendOtPtoUser']);
    Route::post('/verify-otp',[AuthController::class,'verifyOtp']);
    Route::post('/verify-user',[AuthController::class,'verifyUser']);
});