// frontend/src/components/simulations/D3Renderer.tsx
// Renders D3.js visualizations from LLM-generated configurations

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
// Import types from shared directory
import type { D3VisualizationSpec } from '@shared/index.ts';

interface D3RendererProps {
  spec: D3VisualizationSpec;
  width?: number;
  height?: number;
  className?: string;
  onClick?: () => void;
}

export default function D3Renderer({
  spec,
  width = 400,
  height = 300,
  className = '',
  onClick
}: D3RendererProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !spec) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();

    // Render based on capability
    switch (spec.selectedCapability) {
      case 'tree-diagram':
        renderTreeDiagram(spec);
        break;
      case 'force-directed-graph':
        renderForceGraph(spec);
        break;
      case 'bar-chart':
        renderBarChart(spec);
        break;
      case 'line-chart':
        renderLineChart(spec);
        break;
      case 'scatter-plot':
        renderScatterPlot(spec);
        break;
      case 'pie-chart':
        renderPieChart(spec);
        break;
      case 'cluster-diagram':
        renderClusterDiagram(spec);
        break;
      default:
        renderPlaceholder(spec);
    }
  }, [spec, width, height]);

  const renderTreeDiagram = (spec: D3VisualizationSpec) => {
    if (!svgRef.current) return;

    // Validate data structure for tree diagram (hierarchical)
    if (!spec.data || typeof spec.data !== 'object' || Array.isArray(spec.data)) {
      console.error('Tree diagram expects hierarchical object data, got:', typeof spec.data);
      return renderPlaceholder(spec);
    }

    const hierarchicalData = spec.data as any;
    if (!hierarchicalData.name) {
      console.error('Tree diagram expects root node with "name" property');
      return renderPlaceholder(spec);
    }

    const svg = d3.select(svgRef.current);
    const margin = spec.configuration.margin || { top: 20, right: 120, bottom: 20, left: 120 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear and setup
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create tree layout
    const treeLayout = d3.tree()
      .size([innerHeight, innerWidth]);

    // Create hierarchy
    const root = d3.hierarchy(hierarchicalData);

    // Apply tree layout
    treeLayout(root);

    // Add links
    g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', (d: any) => {
        const linkGenerator = d3.linkHorizontal()
          .x((link: any) => link.y)
          .y((link: any) => link.x);
        return linkGenerator(d);
      })
      .attr('fill', 'none')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 2);

    // Add nodes
    const nodes = g.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.y},${d.x})`);

    nodes.append('circle')
      .attr('r', 8)
      .attr('fill', '#4A90E2')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    nodes.append('text')
      .attr('dy', '.35em')
      .attr('x', (d: any) => d.children ? -12 : 12)
      .attr('text-anchor', (d: any) => d.children ? 'end' : 'start')
      .text((d: any) => d.data.name)
      .attr('font-size', '12px')
      .attr('fill', '#333');
  };

  const renderForceGraph = (spec: D3VisualizationSpec) => {
    if (!svgRef.current) return;

    // Validate data structure for force-directed graph
    if (!spec.data || typeof spec.data !== 'object' || Array.isArray(spec.data)) {
      console.error('Force graph expects object with nodes/links, got:', typeof spec.data);
      return renderPlaceholder(spec);
    }

    const graphData = spec.data as any;
    if (!graphData.nodes || !graphData.links || !Array.isArray(graphData.nodes) || !Array.isArray(graphData.links)) {
      console.error('Force graph expects {nodes: [], links: []} structure');
      return renderPlaceholder(spec);
    }

    if (!graphData.nodes.length) {
      console.warn('Force graph received empty nodes array');
      return renderPlaceholder(spec);
    }

    const svg = d3.select(svgRef.current);
    const simulation = d3.forceSimulation(graphData.nodes)
      .force('link', d3.forceLink(graphData.links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    svg.attr('width', width).attr('height', height);

    // Add links
    const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(graphData.links)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2);

    // Add nodes
    const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(graphData.nodes)
      .enter()
      .append('circle')
      .attr('r', 8)
      .attr('fill', '#4A90E2')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .call(d3.drag<SVGCircleElement, any>()
        .on('start', (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    // Add labels
    const labels = svg.append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(graphData.nodes)
      .enter()
      .append('text')
      .text((d: any) => d.name)
      .attr('font-size', '12px')
      .attr('dx', 12)
      .attr('dy', 4)
      .attr('fill', '#333');

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      labels
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });
  };

  const renderBarChart = (spec: D3VisualizationSpec) => {
    if (!svgRef.current) return;

    // Validate data structure for bar chart
    if (!Array.isArray(spec.data)) {
      console.error('Bar chart expects array data, got:', typeof spec.data);
      return renderPlaceholder(spec);
    }

    const data = spec.data as Array<{label: string, value: number}>;
    if (!data.length) {
      console.warn('Bar chart received empty data array');
      return renderPlaceholder(spec);
    }

    const svg = d3.select(svgRef.current);
    const margin = spec.configuration.margin || { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear and setup
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, innerWidth])
      .padding(0.1);

    const maxValue = d3.max(data, d => d.value) || 0;
    const y = d3.scaleLinear()
      .domain([0, Number(maxValue)])
      .range([innerHeight, 0]);

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    g.append('g')
      .call(d3.axisLeft(y));

    // Bars
    g.selectAll('.bar')
      .data(spec.data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d: any) => x(d.label)!)
      .attr('y', (d: any) => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', (d: any) => innerHeight - y(d.value))
      .attr('fill', '#4A90E2');

    // Values on bars
    if (spec.configuration.showValues) {
      g.selectAll('.value-label')
        .data(spec.data)
        .enter()
        .append('text')
        .attr('class', 'value-label')
        .attr('x', (d: any) => x(d.label)! + x.bandwidth() / 2)
        .attr('y', (d: any) => y(d.value) - 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', '#333')
        .text((d: any) => d.value);
    }
  };

  const renderLineChart = (spec: D3VisualizationSpec) => {
    if (!svgRef.current) return;

    // Validate data structure for line chart
    if (!Array.isArray(spec.data)) {
      console.error('Line chart expects array data, got:', typeof spec.data);
      return renderPlaceholder(spec);
    }

    const data = spec.data as Array<{x: number, y: number, label?: string}>;
    if (!data.length) {
      console.warn('Line chart received empty data array');
      return renderPlaceholder(spec);
    }

    // Validate that data points have required x,y properties
    const validData = data.filter(d => typeof d.x === 'number' && typeof d.y === 'number');
    if (!validData.length) {
      console.error('Line chart data points missing required x,y numeric properties');
      return renderPlaceholder(spec);
    }

    const svg = d3.select(svgRef.current);
    const margin = spec.configuration.margin || { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear and setup
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Process data
    const xValues = validData.map(d => d.x);
    const yValues = validData.map(d => d.y);

    // Scales
    const xScale = d3.scaleLinear()
      .domain([d3.min(xValues)!, d3.max(xValues)!])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(yValues)!])
      .nice()
      .range([innerHeight, 0]);

    // Line generator
    const line = d3.line<any>()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveLinear);

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale));

    g.append('g')
      .call(d3.axisLeft(yScale));

    // Add line
    g.append('path')
      .datum(validData)
      .attr('fill', 'none')
      .attr('stroke', '#2563eb')
      .attr('stroke-width', spec.interactiveParameters?.find(p => p.name === 'lineWidth')?.defaultValue || 2)
      .attr('d', line);

    // Add points if showPoints is enabled
    const showPoints = spec.interactiveParameters?.find(p => p.name === 'showPoints')?.defaultValue ?? true;
    if (showPoints) {
      g.selectAll('.point')
        .data(validData)
        .enter()
        .append('circle')
        .attr('class', 'point')
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', 4)
        .attr('fill', '#2563eb')
        .attr('stroke', 'white')
        .attr('stroke-width', 2);
    }
  };

  const renderScatterPlot = (spec: D3VisualizationSpec) => {
    if (!svgRef.current) return;

    // Validate data structure for scatter plot
    if (!Array.isArray(spec.data)) {
      console.error('Scatter plot expects array data, got:', typeof spec.data);
      return renderPlaceholder(spec);
    }

    const data = spec.data as Array<{x: number, y: number, label?: string, category?: string}>;
    if (!data.length) {
      console.warn('Scatter plot received empty data array');
      return renderPlaceholder(spec);
    }

    // Validate that data points have required x,y properties
    const validData = data.filter(d => typeof d.x === 'number' && typeof d.y === 'number');
    if (!validData.length) {
      console.error('Scatter plot data points missing required x,y numeric properties');
      return renderPlaceholder(spec);
    }

    const svg = d3.select(svgRef.current);
    const margin = spec.configuration.margin || { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear and setup
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Process data
    const xValues = validData.map(d => d.x);
    const yValues = validData.map(d => d.y);

    // Scales
    const xScale = d3.scaleLinear()
      .domain([d3.min(xValues)!, d3.max(xValues)!])
      .nice()
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([d3.min(yValues)!, d3.max(yValues)!])
      .nice()
      .range([innerHeight, 0]);

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale));

    g.append('g')
      .call(d3.axisLeft(yScale));

    // Add points
    const pointSize = spec.interactiveParameters?.find(p => p.name === 'pointSize')?.defaultValue || 5;
    const showLabels = spec.interactiveParameters?.find(p => p.name === 'showLabels')?.defaultValue || false;

    g.selectAll('.point')
      .data(validData)
      .enter()
      .append('circle')
      .attr('class', 'point')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', pointSize)
      .attr('fill', '#2563eb')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Add labels if enabled
    if (showLabels) {
      g.selectAll('.label')
        .data(validData)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => xScale(d.x) + pointSize + 5)
        .attr('y', d => yScale(d.y) - 5)
        .attr('font-size', '12px')
        .attr('fill', '#333')
        .text(d => d.label || '');
    }
  };

  const renderPieChart = (spec: D3VisualizationSpec) => {
    if (!svgRef.current) return;

    // Validate data structure for pie chart
    if (!Array.isArray(spec.data)) {
      console.error('Pie chart expects array data, got:', typeof spec.data);
      return renderPlaceholder(spec);
    }

    const data = spec.data as Array<{label: string, value: number, color?: string}>;
    if (!data.length) {
      console.warn('Pie chart received empty data array');
      return renderPlaceholder(spec);
    }

    // Validate that data points have required label,value properties
    const validData = data.filter(d => typeof d.value === 'number' && d.label);
    if (!validData.length) {
      console.error('Pie chart data points missing required label or numeric value properties');
      return renderPlaceholder(spec);
    }

    const svg = d3.select(svgRef.current);
    const margin = spec.configuration.margin || { top: 20, right: 20, bottom: 20, left: 20 };
    const radius = Math.min(width, height) / 2 - Math.max(margin.top, margin.right, margin.bottom, margin.left);

    // Clear and setup
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Process data
    const pie = d3.pie<{label: string, value: number, color?: string}>()
      .value(d => d.value)
      .sort(null);

    const arc = d3.arc<d3.PieArcDatum<{label: string, value: number, color?: string}>>()
      .innerRadius(spec.interactiveParameters?.find(p => p.name === 'innerRadius')?.defaultValue || 0)
      .outerRadius(radius);

    // Color scale
    const color = d3.scaleOrdinal<string, string>(d3.schemeCategory10);

    // Add slices
    const slices = g.selectAll('.slice')
      .data(pie(validData))
      .enter()
      .append('g')
      .attr('class', 'slice');

    slices.append('path')
      .attr('d', arc)
      .attr('fill', (_d, i) => color(String(i)))
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Add labels if enabled
    const showLabels = spec.interactiveParameters?.find(p => p.name === 'showLabels')?.defaultValue ?? true;
    if (showLabels) {
      slices.append('text')
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', 'white')
        .attr('font-weight', 'bold')
        .text(d => `${((d.data.value / d3.sum(validData, d => d.value)) * 100).toFixed(1)}%`);
    }

    // Add legend if enabled
    const showLegend = spec.interactiveParameters?.find(p => p.name === 'showLegend')?.defaultValue ?? true;
    if (showLegend) {
      const legend = svg.append('g')
        .attr('transform', `translate(${width - 120}, 20)`);

      validData.forEach((d: {label: string, value: number, color?: string}, i: number) => {
        const legendRow = legend.append('g')
          .attr('transform', `translate(0, ${i * 20})`);

        legendRow.append('rect')
          .attr('width', 10)
          .attr('height', 10)
          .attr('fill', color(String(i)));

        legendRow.append('text')
          .attr('x', 15)
          .attr('y', 10)
          .attr('font-size', '12px')
          .attr('fill', '#333')
          .text(d.label);
      });
    }
  };

  const renderClusterDiagram = (spec: D3VisualizationSpec) => {
    if (!svgRef.current) return;

    // Validate data structure for cluster diagram (hierarchical)
    if (!spec.data || typeof spec.data !== 'object' || Array.isArray(spec.data)) {
      console.error('Cluster diagram expects hierarchical object data, got:', typeof spec.data);
      return renderPlaceholder(spec);
    }

    const hierarchicalData = spec.data as any;
    if (!hierarchicalData.name) {
      console.error('Cluster diagram expects root node with "name" property');
      return renderPlaceholder(spec);
    }

    const svg = d3.select(svgRef.current);
    const margin = spec.configuration.margin || { top: 20, right: 120, bottom: 20, left: 120 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear and setup
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Process hierarchical data
    const root = d3.hierarchy(hierarchicalData);
    const tree = d3.cluster<any>()
      .size([innerHeight, innerWidth])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2));

    tree(root);

    // Add links
    g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', (d: any) => {
        const source = d.source as any;
        const target = d.target as any;
        return `M${source.y},${source.x}L${target.y},${target.x}`;
      })
      .attr('fill', 'none')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 2);

    // Add nodes
    const nodeSize = spec.interactiveParameters?.find(p => p.name === 'nodeSize')?.defaultValue || [15, 15];

    const nodes = g.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`);

    nodes.append('circle')
      .attr('r', d => d.children ? nodeSize[0] / 2 : nodeSize[1] / 2)
      .attr('fill', d => d.children ? '#2563eb' : '#10b981')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    nodes.append('text')
      .attr('dy', d => d.children ? '-8px' : '4px')
      .attr('x', d => d.children ? 0 : 8)
      .attr('text-anchor', d => d.children ? 'middle' : 'start')
      .attr('font-size', '12px')
      .attr('fill', '#333')
      .text(d => d.data.name);
  };

  const renderPlaceholder = (spec: D3VisualizationSpec) => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#f5f5f5')
      .attr('stroke', '#ddd');

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('fill', '#666')
      .text(`Visualization: ${spec.selectedCapability}`);
  };

  return (
    <div className={`d3-renderer ${className}`} onClick={onClick}>
      <svg ref={svgRef} className="w-full h-auto" />
      {spec.explanation && (
        <p className="text-sm text-[var(--muted-text)] mt-2">
          {spec.explanation}
        </p>
      )}
    </div>
  );
}
