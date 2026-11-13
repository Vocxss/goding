import { query } from "@/lib/db";
import { User } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
        return NextResponse.json({ message: "Email dan password harus diisi" }, { status: 400 });
    }
    
    try {
            const { rows: existedAccount } = await query<User>(
                'SELECT * FROM users WHERE email = $1', [email]
            )
        
            if (existedAccount.length > 0) {
                return NextResponse.json({ message: "Email sudah terdaftar" }, { status: 400 });
            }
        
            const { rows: newAccount } = await query<User>(
                'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
                [username, email, password]
            ) 

            return NextResponse.json({ message: "Akun berhasil dibuat" }, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Terjadi kesalahan pada server" }, { status: 500 });
    }
}