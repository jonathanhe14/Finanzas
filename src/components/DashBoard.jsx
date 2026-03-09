import React from "react";
import Card from "./Card";
import { Wallet } from "lucide-react";

export default function DashBoard() {
  return (
    <div className="">
      <div>DashBoard</div>
      <Card title="Saldo" amount={200} ></Card>
    </div>
  );
}
