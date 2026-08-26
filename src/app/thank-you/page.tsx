"use client";

import React from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import DefaultLayout from "../defaultLayout";

const ThankYouPage = () => {
  return (
    <DefaultLayout>
      <div className="flex items-center justify-center min-h-[70vh] bg-gradient-to-br from-red-50 via-white to-red-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border-2 border-red-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Thank You!
          </h1>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            Your profile has been successfully saved. We have updated your information in our system.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/profile"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#A51C30] text-white rounded-lg font-medium hover:bg-[#8a1527] transition-colors"
            >
              Back to Profile
            </Link>
            <Link 
              href="/"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#A51C30] border-2 border-[#A51C30] rounded-lg font-medium hover:bg-red-50 transition-colors"
            >
              Go Home <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ThankYouPage;
