/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import React from "react";
import * as Icons from "lucide-react";

export interface ManagementSection {
  title: string;
  description: string;
  iconName: string;
  href: string;
  count: string;
  isDisabled?: boolean;
}

interface ManagementTableProps {
  sections: ManagementSection[];
}

export function ManagementTable({ sections }: ManagementTableProps) {
  const [tableVisible, setTableVisible] = useState(true);

  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[toPascalCase(iconName)];
    return IconComponent || Icons.HelpCircle;
  };

  const toPascalCase = (str: string) => {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  };

  return (
    <div className="rounded-md border">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent"
        onClick={() => setTableVisible(!tableVisible)}
      >
        <h2 className="text-lg font-semibold">Sections de Gestion</h2>
        {tableVisible ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </div>
      
      {tableVisible && (
        <Table>
          <TableCaption>Liste de toutes les sections de gestion</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Section</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-[100px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sections.map((section) => (
              <TableRow key={section.href} className={section.isDisabled ? "opacity-50 cursor-not-allowed" : ""}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {React.createElement(getIcon(section.iconName), { className: "h-4 w-4" })}
                    {section.title}
                  </div>
                </TableCell>
                <TableCell>{section.description}</TableCell>
                <TableCell>{section.count}</TableCell>
                <TableCell>
                  <Button disabled={section.isDisabled} variant="ghost" size="sm" asChild>
                    <a href={section.href} className={section.isDisabled ? "pointer-events-none" : ""}>
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
} 