"use client";

import { IoMdCart } from "react-icons/io";
import { FiSearch, FiLogOut } from "react-icons/fi";
import { AiOutlineUser } from "react-icons/ai";

import Container from "./Container";
import Logo from "./Logo";
import Image from "next/image";
import Link from "next/link";
import AuthenticationInfo from "./AuthenticationInfo";

export default function Header() {
  return (
    <div className="bg-bodyColor h-20 top-0 sticky z-50">
      <Container className="h-full flex items-center md:gap-x-5 justify-between md:justify-start">
        <Logo />
        {/* Search Field */}
        <div
          className="w-full bg-white hidden md:flex items-center gap-x-1 border-[1px] border-lightText/50 
                    rounded-full px-4 py-1.5 focus-within:border-orange-600 group"
        >
          <FiSearch className="text-gray-500 group-focus-within:text-darkText duration-200" />
          <input
            type="text"
            placeholder="Search for products"
            className="placeholder:text-sm flex-1 outline-none"
          />
        </div>

        {/* Login/Register */}
        <AuthenticationInfo />
        
        {/* Cart button */}
        <div
          className="bg-black hover:bg-slate-950 rounded-full text-slate-100 hover:text-white 
                        flex items-center justify-center gap-x-1 px-3 py-1.5 border-[1px] border-black 
                        hover:border-orange-600 duration-200 relative"
        >
          <IoMdCart className="text-2xl" />
          <p className="text-sm font-semibold">$0.00</p>
          <span
            className="bg-white text-orange-600 rounded-full text-xs font-semibold absolute 
                            -right-2 -top-1 w-5 h-5 flex items-center justify-center shadow-xl shadow-black"
          >
            0
          </span>
        </div>
        {/* User image */}
        {/* {session && (
          <Image
            src={session?.user?.image as string}
            alt="user profile image"
            width={50}
            height={50}
            className="rounded-full object-cover"
          />
        )} */}
        {/* Logout button */}
        {/* {session && (
          <div
            onClick={() => signOut()}
            className="headerDiv px-2 gap-x-1 cursor-pointer"
          >
            <FiLogOut className="text-2xl" />
            <p className="text-sm font-semibold">Logout</p>
          </div>
        )} */}
      </Container>
    </div>
  );
};
