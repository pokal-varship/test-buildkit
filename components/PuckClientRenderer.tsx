"use client";
import { Render, Data } from "@measured/puck";
import config from "puck.config";

export default function PuckClientRenderer({ data }: { data: Data }) {
  return <Render data={data} config={config} />;
} 