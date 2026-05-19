import React, { useState } from 'react';
import { Mail, MessageCircle, HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const UniversityLogin = () => {
  
  return (
    <div className=" right-side bg-gray-50 flex flex-col justify-center">
      {/* Main Content */}
      <div className="grow main-right-side flex items-center justify-center px-4 py-12">
        <div className="w-[75vh]">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-10 ">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-color-primary mb-2">Sign In</h1>
          </div>
            <form>
              <div className="mb-6">
                <label htmlFor="University-id" className="block text-md font-medium text-gray-700 mb-2">
                  Enter University ID 
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    id="University-id"
                    
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    
                    autoComplete="username"
                  />
                </div>
            
                
                {/* Forgot ID Link */}
                <div className="mt-8">
                  <Link 
                    to="/forgot-id" 
                    className="text-sm text-color-primary font-medium inline-flex items-center gap-1"
                  >
                    Forgot Your University ID?
                  </Link>
                </div>
                <div className='mt-8'>
                    <button type="submit" className="custom-btn  w-full  gap-2">
                    Continue
                  </button>
                </div>
              </div>

            </form>

            {/* Separator */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Secondary Buttons */}
            <div className="mt-8">
              <button className="w-full custom-support-btn border  py-3 px-4 rounded-md font-medium transition-colors">
                Create Your University ID
              </button>
              
              <button className="w-full mt-8 custom-support-btn py-3 px-4 rounded-md font-medium transition-colors">
                Manage My University ID
              </button>
            </div>
          </div>

          {/* Help Links */}
          <div className="mt-8 flex bg-white p-4 rounded flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm">
            <Link 
              to="/support" 
              className="text-color-primary  transition-colors inline-flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Chat with support
            </Link>
            
            <Link 
              to="/help" 
              className="text-color-primary  transition-colors inline-flex items-center gap-2"
            >
              <HelpCircle className="h-4 w-4" />
              Help Center
            </Link>
          </div>

          
        </div>
      </div>

      
    </div>
  );
};

export default UniversityLogin;
