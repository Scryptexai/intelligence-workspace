"use client";

import {
  AppWindow,
  Building2,
  Landmark,
  Layers,
  Scale,
  ShieldCheck,
  TrendingUp,
  User,
  Vote,
} from "lucide-react";
import type { Entity, EntityType } from "@/lib/types/entity";
import { entityBrandUrls, entityBrandMeta, ENTITY_TYPE_ICON_COLOR } from "@/lib/brand";
import { BrandLogo } from "./BrandLogo";
import { cn } from "@/lib/utils/helpers";

const TYPE_ICON: Record<EntityType, typeof User> = {
  Person: User,
  Company: Building2,
  Foundation: Landmark,
  Protocol: Layers,
  Investor: TrendingUp,
  Application: AppWindow,
  Security: ShieldCheck,
  DAO: Vote,
  Government: Scale,
};

export function EntityLogo({
  entity,
  size = 28,
  className,
}: {
  entity: Entity;
  size?: number;
  className?: string;
}) {
  const urls = entityBrandUrls(entity.id);
  const meta = entityBrandMeta(entity.id);
  const color = meta.color ?? ENTITY_TYPE_ICON_COLOR[entity.type];
  const Icon = TYPE_ICON[entity.type];

  if (urls.length > 0) {
    return (
      <BrandLogo
        urls={urls}
        color={color}
        size={size}
        chip={meta.chip}
        initials={entity.name.slice(0, 2).toUpperCase()}
        className={cn("border border-border/70 bg-card shadow-sm", className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border",
        className
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: `${color}1f`,
        borderColor: `${color}55`,
        color,
      }}
    >
      <Icon style={{ width: size * 0.55, height: size * 0.55 }} strokeWidth={2} />
    </span>
  );
}
