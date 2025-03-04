'use client';
import { Card, CardBody, CardFooter, Image } from "@heroui/react";

export default function App() {
  const list = [
    {
      title: "Orange",
      price: "$5.50",
      img: "image/orange.jpg",  
    },
    {
      title: "Tangerine",
      img: "image/tangerine.jpg", 
      price: "$3.00", 
    },
    {
      title: "Raspberry",
      price: "$10.00",
      img: "image/raspberry.jpg",
    },
    {
      title: "Lemon",
      price: "$5.30",
      img: "image/lemon.jpg",
    },
    {
      title: "Avocado",
      price: "$15.70",
      img: "images/avocado.jpg",
    },
    {
      title: "Lemon 2",
      price: "$8.00",
      img: "image/lemon2.jpg",
    },
    {
      title: "Banana",
      price: "$7.50",
      img: "image/banana.jpg",
    },
    {
      title: "Watermelon",
      price: "$12.20",
      img: "image/watermelon.jpg",
    },
  ];

  return (
    <div className="gap-2 grid grid-cols-2 sm:grid-cols-4">
      {list.map((item, index) => (
        <Card key={index} isPressable shadow="sm" onPress={() => console.log("item pressed")}>
          <CardBody className="overflow-visible p-0">
            <Image
              alt={item.title}
              className="w-full object-cover h-[140px]"
              radius="lg"
              shadow="sm"
              src={item.img || 'images/default.jpg'}  // Fallback image in case img is missing
              width="100%"
            />
          </CardBody>
          <CardFooter className="text-small justify-between">
            <b>{item.title}</b>
            <p className="text-default-500">{item.price}</p>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}