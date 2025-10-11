// shared/d3/visualization-registry.ts
// Single source of truth for D3 visualization types used by frontend and backend

/**
 * UI-facing visualization type definition
 */
export interface VisualizationType {
  id: string;
  name: string;
  description: string;
  icon: string;
  useCase: string;
  capabilityName: string; // Links to backend implementation
  category: 'hierarchy' | 'network' | 'chart';
  implemented: boolean; // Whether backend has full implementation
  educationalUseCases: string[];
}

/**
 * Available visualization types - Single source of truth
 * Frontend selector and backend LLM both use this registry
 */
export const VISUALIZATION_TYPES: VisualizationType[] = [
  // AI Choice (special case, always available)
  {
    id: 'ai-choice',
    name: 'AI Choose Best',
    description: 'Let AI analyze your content and pick the most appropriate visualization',
    icon: '🤖',
    useCase: 'Automatic selection based on content analysis',
    capabilityName: 'ai-choice',
    category: 'chart', // Not used for AI choice
    implemented: true,
    educationalUseCases: ['Automatic content analysis', 'Smart visualization selection']
  },

  // ===== IMPLEMENTED VISUALIZATIONS =====

  // Hierarchy Layouts
  {
    id: 'tree-diagram',
    name: 'Tree Diagram',
    description: 'Show hierarchical relationships and decision trees',
    icon: '🌳',
    useCase: 'Perfect for processes, hierarchies, and decision flows',
    capabilityName: 'tree-diagram',
    category: 'hierarchy',
    implemented: true,
    educationalUseCases: [
      'Decision tree visualization',
      'Classification hierarchy',
      'Process flow representation',
      'Probability tree diagrams'
    ]
  },
  {
    id: 'cluster-diagram',
    name: 'Cluster Diagram',
    description: 'Display clustered hierarchical relationships',
    icon: '🌿',
    useCase: 'Great for showing grouped hierarchies and relationships',
    capabilityName: 'cluster-diagram',
    category: 'hierarchy',
    implemented: true, // ✅ Implemented in backend
    educationalUseCases: [
      'Taxonomy visualization',
      'Grouped hierarchies',
      'Relationship clustering'
    ]
  },

  // Network/Force Layouts
  {
    id: 'force-directed-graph',
    name: 'Network Graph',
    description: 'Visualize connections and relationships between items',
    icon: '🕸️',
    useCase: 'Great for networks, dependencies, and complex relationships',
    capabilityName: 'force-directed-graph',
    category: 'network',
    implemented: true,
    educationalUseCases: [
      'Concept relationship mapping',
      'Dependency visualization',
      'Knowledge graph representation',
      'System architecture diagrams'
    ]
  },

  // Charts
  {
    id: 'bar-chart',
    name: 'Bar Chart',
    description: 'Compare quantities and show distributions',
    icon: '📊',
    useCase: 'Ideal for comparisons, rankings, and statistical data',
    capabilityName: 'bar-chart',
    category: 'chart',
    implemented: true,
    educationalUseCases: [
      'Data comparison visualization',
      'Frequency distribution representation',
      'Survey results display',
      'Performance metrics comparison'
    ]
  },
  {
    id: 'line-chart',
    name: 'Line Chart',
    description: 'Show trends and changes over time or categories',
    icon: '📈',
    useCase: 'Perfect for time series, trends, and continuous data',
    capabilityName: 'line-chart',
    category: 'chart',
    implemented: true, // ✅ Implemented in backend
    educationalUseCases: [
      'Time series analysis',
      'Trend visualization',
      'Growth patterns',
      'Comparative analysis over time'
    ]
  },
  {
    id: 'scatter-plot',
    name: 'Scatter Plot',
    description: 'Show relationships between two variables',
    icon: '📍',
    useCase: 'Excellent for correlation analysis and distribution patterns',
    capabilityName: 'scatter-plot',
    category: 'chart',
    implemented: true, // ✅ Implemented in backend
    educationalUseCases: [
      'Correlation analysis',
      'Variable relationships',
      'Data distribution patterns',
      'Statistical analysis'
    ]
  },
  {
    id: 'pie-chart',
    name: 'Pie Chart',
    description: 'Show proportional relationships and percentages',
    icon: '🥧',
    useCase: 'Great for showing parts of a whole and proportions',
    capabilityName: 'pie-chart',
    category: 'chart',
    implemented: true, // ✅ Implemented in backend
    educationalUseCases: [
      'Proportion visualization',
      'Percentage breakdown',
      'Market share analysis',
      'Budget allocation display'
    ]
  },

  // ===== PLANNED VISUALIZATIONS (Not Yet Implemented) =====

  {
    id: 'treemap',
    name: 'Treemap',
    description: 'Display hierarchical data using nested rectangles',
    icon: '🏗️',
    useCase: 'Ideal for showing hierarchical proportions and space allocation',
    capabilityName: 'treemap',
    category: 'hierarchy',
    implemented: false,
    educationalUseCases: [
      'File system visualization',
      'Budget allocation',
      'Portfolio analysis',
      'Space utilization'
    ]
  },
  {
    id: 'pack-layout',
    name: 'Circle Packing',
    description: 'Show hierarchical data using nested circles',
    icon: '🔵',
    useCase: 'Perfect for hierarchical proportions and containment',
    capabilityName: 'pack-layout',
    category: 'hierarchy',
    implemented: false,
    educationalUseCases: [
      'Organizational charts',
      'Data hierarchy visualization',
      'Nested relationships',
      'Size-based hierarchies'
    ]
  },
  {
    id: 'partition-chart',
    name: 'Partition Chart',
    description: 'Show hierarchical data using icicle/sunburst layouts',
    icon: '🌀',
    useCase: 'Excellent for hierarchical data with proportional relationships',
    capabilityName: 'partition-chart',
    category: 'hierarchy',
    implemented: false,
    educationalUseCases: [
      'File system analysis',
      'Budget breakdowns',
      'Category hierarchies',
      'Nested data structures'
    ]
  },
  {
    id: 'area-chart',
    name: 'Area Chart',
    description: 'Show cumulative data trends with filled areas',
    icon: '🌊',
    useCase: 'Great for cumulative trends and stacked data over time',
    capabilityName: 'area-chart',
    category: 'chart',
    implemented: false,
    educationalUseCases: [
      'Cumulative trends',
      'Stacked data visualization',
      'Volume changes over time',
      'Multi-series comparisons'
    ]
  }
];

/**
 * Get only implemented visualization types for frontend selector
 */
export const getImplementedVisualizationTypes = (): VisualizationType[] => {
  return VISUALIZATION_TYPES.filter(type => type.implemented);
};

/**
 * Get visualization type by ID
 */
export const getVisualizationTypeById = (id: string): VisualizationType | undefined => {
  return VISUALIZATION_TYPES.find(type => type.id === id);
};

/**
 * Get visualization types by category
 */
export const getVisualizationTypesByCategory = (category: VisualizationType['category']): VisualizationType[] => {
  return VISUALIZATION_TYPES.filter(type => type.category === category);
};

/**
 * Check if a visualization type is implemented
 */
export const isVisualizationTypeImplemented = (id: string): boolean => {
  const type = getVisualizationTypeById(id);
  return type ? type.implemented : false;
};
