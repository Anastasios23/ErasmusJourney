import React from "react";
import { Badge } from "./ui/badge";
import CostLevelBadge from "./CostLevelBadge";
import StandardIcon from "./StandardIcon";
import { CARD_STYLES, TEXT_STYLES } from "../utils/visualConsistency";
import { GRID_LAYOUTS } from "../utils/responsiveLayout";

/**
 * Visual Consistency Demo Component
 * Demonstrates the standardized design system components
 */
export default function VisualConsistencyDemo() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <header className="text-center">
          <h1 className={`${TEXT_STYLES.hero} text-gray-900 mb-4`}>
            Visual Consistency Demo
          </h1>
          <p className={`${TEXT_STYLES.body} text-gray-600 max-w-2xl mx-auto`}>
            Showcase of the standardized design system components for the
            Erasmus Journey platform.
          </p>
        </header>

        {/* Badge System */}
        <section className={CARD_STYLES.base} style={{ padding: "2rem" }}>
          <h2 className={`${TEXT_STYLES.heading} mb-6`}>
            Standardized Badge System
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Status Badges</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="success">Approved</Badge>
                <Badge variant="warning">Pending Review</Badge>
                <Badge variant="info">Published</Badge>
                <Badge variant="error">Rejected</Badge>
                <Badge variant="secondary">Submitted</Badge>
                <Badge variant="outline">Deleted</Badge>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Cost Level Badges</h3>
              <div className="flex flex-wrap gap-2">
                <CostLevelBadge level="low" amount={600} currency="EUR" />
                <CostLevelBadge level="medium" amount={1200} currency="EUR" />
                <CostLevelBadge level="high" amount={2000} currency="EUR" />
                <CostLevelBadge level="low" />
                <CostLevelBadge level="medium" />
                <CostLevelBadge level="high" />
              </div>
            </div>
          </div>
        </section>

        {/* Icon System */}
        <section className={CARD_STYLES.base} style={{ padding: "2rem" }}>
          <h2 className={`${TEXT_STYLES.heading} mb-6`}>
            Standardized Icon System
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Icon Sizes</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <StandardIcon icon="university" size="xs" />
                  <span>XS (12px)</span>
                </div>
                <div className="flex items-center gap-2">
                  <StandardIcon icon="university" size="sm" />
                  <span>SM (16px)</span>
                </div>
                <div className="flex items-center gap-2">
                  <StandardIcon icon="university" size="md" />
                  <span>MD (20px)</span>
                </div>
                <div className="flex items-center gap-2">
                  <StandardIcon icon="university" size="lg" />
                  <span>LG (24px)</span>
                </div>
                <div className="flex items-center gap-2">
                  <StandardIcon icon="university" size="xl" />
                  <span>XL (32px)</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Icon Colors</h3>
              <div className="flex items-center gap-4">
                <StandardIcon icon="star" color="primary" />
                <StandardIcon icon="star" color="secondary" />
                <StandardIcon icon="star" color="success" />
                <StandardIcon icon="star" color="warning" />
                <StandardIcon icon="star" color="error" />
                <StandardIcon icon="star" color="muted" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Semantic Icons</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <StandardIcon icon="location" />
                  <span>Location</span>
                </div>
                <div className="flex items-center gap-2">
                  <StandardIcon icon="university" />
                  <span>University</span>
                </div>
                <div className="flex items-center gap-2">
                  <StandardIcon icon="cost" />
                  <span>Cost</span>
                </div>
                <div className="flex items-center gap-2">
                  <StandardIcon icon="rating" />
                  <span>Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <StandardIcon icon="success" />
                  <span>Success</span>
                </div>
                <div className="flex items-center gap-2">
                  <StandardIcon icon="warning" />
                  <span>Warning</span>
                </div>
                <div className="flex items-center gap-2">
                  <StandardIcon icon="error" />
                  <span>Error</span>
                </div>
                <div className="flex items-center gap-2">
                  <StandardIcon icon="edit" />
                  <span>Edit</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Layout System */}
        <section className={CARD_STYLES.base} style={{ padding: "2rem" }}>
          <h2 className={`${TEXT_STYLES.heading} mb-6`}>
            Responsive Layout System
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Grid Layouts</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Three Column Grid (responsive)
                  </p>
                  <div className={GRID_LAYOUTS.threeColumn}>
                    <div className="bg-blue-100 p-4 rounded">Column 1</div>
                    <div className="bg-blue-100 p-4 rounded">Column 2</div>
                    <div className="bg-blue-100 p-4 rounded">Column 3</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Typography Scale */}
        <section className={CARD_STYLES.base} style={{ padding: "2rem" }}>
          <h2 className={`${TEXT_STYLES.heading} mb-6`}>Typography Scale</h2>

          <div className="space-y-4">
            <div className={TEXT_STYLES.hero}>Hero Text</div>
            <div className={TEXT_STYLES.heading}>Heading Text</div>
            <div className={TEXT_STYLES.subheading}>Subheading Text</div>
            <div className={TEXT_STYLES.body}>
              Body text with proper line height and spacing for optimal
              readability.
            </div>
            <div className={TEXT_STYLES.small}>
              Small text for secondary information
            </div>
            <div className={TEXT_STYLES.caption}>
              Caption text for minimal details
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
