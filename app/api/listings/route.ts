import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !currentUser.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      imageSrc,
      category,
      roomCount,
      bathroomCount,
      guestCount,
      location,
      price,
    } = body;

    const images = Array.isArray(imageSrc) ? imageSrc.slice(0, 5) : [imageSrc];

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        imageSrc: images,
        category,
        roomCount,
        bathroomCount,
        guestCount,
        locationValue: location?.value, 
        price: parseInt(price, 10),
        userId: new ObjectId(currentUser.id).toString(),
      },
    });

    return NextResponse.json(listing);
  } catch (error: any) {
    console.error("Error creating listing:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
