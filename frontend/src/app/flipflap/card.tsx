'use client';
import {Card, CardBody, CardFooter, Image} from "@heroui/react";

export default function App() {
  const list = [
    {
      title: "Orange",
      price: "$5.50",
    },
    {
      title: "Tangerine",
      img:'image/fruit-1.jpg',
      price: "$3.00", 
    },
    {
      title: "Raspberry",
      price: "$10.00",
    },
    {
      title: "Lemon",
      price: "$5.30",
    },
    {
      title: "Avocado",
    
      price: "$15.70",
    },
    {
      title: "Lemon 2",
    
      price: "$8.00",
    },
    {
      title: "Banana",
    
      price: "$7.50",
    },
    {
      title: "Watermelon",
    
      price: "$12.20",
    },
  ];

  return (
    <div className="gap-2 grid grid-cols-2 sm:grid-cols-4">
      {list.map((item, index) => (
        /* eslint-disable no-console */
        <Card key={index} isPressable shadow="sm" onPress={() => console.log("item pressed")}>
          <CardBody className="overflow-visible p-0">
            <Image
              alt={item.title}
              className="w-full object-cover h-[140px]"
              radius="lg"
              shadow="sm"
              src={item.img}
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