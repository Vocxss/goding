import { query } from "@/lib/db";
import { User } from "@/lib/types";
import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { full_name, user_name, email, password } = await req.json();

    if (!full_name || !user_name || !email || !password) {
        return NextResponse.json({ message: "Semua field harus diisi" }, { status: 400 });
    }
    
    try {
            const { rows: existedAccount } = await query<User>(
                'SELECT * FROM users WHERE email = $1', [email]
            )
        
            if (existedAccount.length > 0) {
                return NextResponse.json({ message: "Email sudah terdaftar" }, { status: 400 });
            }
        
            const hashedPassword = await bcrypt.hash(password, 10);

            await query(
                'INSERT INTO users (full_name, user_name, email, password_hash, role, avatar_url) VALUES ($1, $2, $3, $4, $5, $6)',
                [full_name, user_name, email, hashedPassword, 'student', null]
            ) 

            return NextResponse.json({ message: "Akun berhasil dibuat" }, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Terjadi kesalahan pada server" }, { status: 500 });
    }
}