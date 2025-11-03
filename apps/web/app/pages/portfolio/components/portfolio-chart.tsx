import { useCallback, useEffect, useMemo, useRef } from 'react';

import * as d3 from 'd3';
import { Box, HTMLStyledProps, styled } from 'leather-styles/jsx';

import { shimmerStyles } from '@leather.io/ui';

import { usePortfolioEvents } from '../portfolio-events';
import { PortfolioAsset } from '../portfolio-table/portfolio-table';

interface PortfolioData {
  token: string;
  percentage: number;
  color: string;
}

const THRESHOLD_PERCENTAGE = 1;

const defaultColors = [
  '#5546FF',
  '#F7931A',
  '#627EEA',
  '#26A17B',
  '#14F195',
  '#E84142',
  '#8247E5',
  '#0033AD',
  '#4A90E2',
  '#50C878',
];

function getColorForAsset(index: number): string {
  return defaultColors[index % defaultColors.length];
}
interface PortfolioChartProps extends HTMLStyledProps<'svg'> {
  assets: PortfolioAsset[];
}

export function PortfolioChart({ assets }: PortfolioChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const groupedItemsRef = useRef<Set<string>>(new Set());

  const { emitAssetHoverOn, emitAssetHoverOff, hoveredSymbol } = usePortfolioEvents();

  const updateChartOpacity = useCallback(() => {
    if (!svgRef.current) return;

    const isHoveredInOtherGroup = hoveredSymbol && groupedItemsRef.current.has(hoveredSymbol);

    d3.select(svgRef.current)
      .selectAll('rect.bar')
      .style('opacity', (d: any) => {
        if (!hoveredSymbol) return 1;

        if (d.token === 'Other' && isHoveredInOtherGroup) return 1;

        if (d.token === hoveredSymbol) return 1;

        return 0.6;
      });
  }, [hoveredSymbol]);

  useEffect(() => {
    updateChartOpacity();
  }, [hoveredSymbol, updateChartOpacity]);

  const portfolioData = useMemo(() => {
    const totalValue = assets.reduce(
      (sum, asset) => sum + Number(asset.quote.availableBalance.amount),
      0
    );

    if (totalValue === 0) return [];

    const rawData: PortfolioData[] = assets.map((asset, index) => ({
      token: asset.asset.symbol,
      percentage: (Number(asset.quote.availableBalance.amount) / totalValue) * 100,
      color: getColorForAsset(index),
    }));

    const itemsToGroup = rawData.filter(item => item.percentage < THRESHOLD_PERCENTAGE);
    const mainItems = rawData.filter(item => item.percentage >= THRESHOLD_PERCENTAGE);

    if (itemsToGroup.length === 0) {
      groupedItemsRef.current.clear();
      return rawData;
    }

    groupedItemsRef.current.clear();
    itemsToGroup.forEach(item => groupedItemsRef.current.add(item.token));

    const otherPercentage = itemsToGroup.reduce((sum, item) => sum + item.percentage, 0);

    return [...mainItems, { token: 'Other', percentage: otherPercentage, color: '#9CA3AF' }];
  }, [assets]);

  useEffect(() => {
    if (!svgRef.current) return;

    const container = svgRef.current.parentElement;
    if (!container) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width } = entry.contentRect;

        const height = 32;
        const margin = { top: 0, right: 0, bottom: 0, left: 0 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        d3.select(svgRef.current).selectAll('*').remove();
        d3.selectAll('.portfolio-tooltip').remove();

        const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);

        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        const tooltip = d3
          .select('body')
          .append('div')
          .attr('class', 'portfolio-tooltip')
          .style('position', 'absolute')
          .style('visibility', 'hidden')
          .style('background-color', 'rgba(0, 0, 0, 0.9)')
          .style('color', 'white')
          .style('padding', '8px 12px')
          .style('border-radius', '4px')
          .style('font-size', '14px')
          .style('pointer-events', 'none')
          .style('z-index', '9999');

        const xScale = d3.scaleLinear().domain([0, 100]).range([0, innerWidth]);

        let cumulativePercentage = 0;
        const barPadding = 4;

        // Create hover handlers
        function handleMouseMove(event: MouseEvent) {
          const tooltipNode = tooltip.node();
          if (!tooltipNode) return;

          const tooltipRect = tooltipNode.getBoundingClientRect();
          const tooltipWidth = tooltipRect.width;
          const tooltipHeight = tooltipRect.height;

          let left = event.pageX - tooltipWidth / 2;
          let top = event.pageY - tooltipHeight - 10;

          // Prevent overflow on right edge
          if (left + tooltipWidth > window.innerWidth) left = window.innerWidth - tooltipWidth - 10;

          // Prevent overflow on left edge
          if (left < 10) {
            left = 10;
          }

          // Prevent overflow on top edge
          if (top < 10) {
            top = event.pageY + 10;
          }

          tooltip.style('top', `${top}px`).style('left', `${left}px`);
        }

        // Draw visible bars
        g.selectAll('rect.bar')
          .data(portfolioData)
          .enter()
          .append('rect')
          .attr('class', 'bar')
          .attr('x', (d, i) => {
            const x = xScale(cumulativePercentage);
            cumulativePercentage += d.percentage;
            return i === 0 ? x : x + barPadding / 2;
          })
          .attr('y', 0)
          .attr('width', (d, i, nodes) => {
            const baseWidth = xScale(d.percentage);
            if (i === 0 && i === nodes.length - 1) return baseWidth;
            if (i === 0 || i === nodes.length - 1) return baseWidth - barPadding / 2;
            return baseWidth - barPadding;
          })
          .attr('height', innerHeight)
          .attr('fill', d => d.color)
          .attr('rx', 4)
          .style('cursor', 'pointer');

        // Reset cumulativePercentage for invisible overlay
        cumulativePercentage = 0;

        // Create invisible overlay rectangles without gaps
        g.selectAll('rect.hover-overlay')
          .data(portfolioData)
          .enter()
          .append('rect')
          .attr('class', 'hover-overlay')
          .attr('x', d => {
            const x = xScale(cumulativePercentage);
            cumulativePercentage += d.percentage;
            return x;
          })
          .attr('y', 0)
          .attr('width', d => xScale(d.percentage))
          .attr('height', innerHeight)
          .attr('fill', 'transparent')
          .style('cursor', 'pointer')
          .on('mouseover', (_event, d) => {
            emitAssetHoverOn(d.token);
            tooltip.style('visibility', 'visible').html(`${d.token}: ${d.percentage.toFixed(1)}%`);
          })
          .on('mousemove', handleMouseMove)
          .on('mouseleave', () => {
            emitAssetHoverOff();
            tooltip.style('visibility', 'hidden');
          });

        g.append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', innerWidth)
          .attr('height', innerHeight)
          .attr('fill', 'none')
          .attr('stroke', 'none');
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      d3.selectAll('.portfolio-tooltip').remove();
    };
  }, [emitAssetHoverOff, emitAssetHoverOn, portfolioData]);

  if (portfolioData.length === 0) return <PortfolioChartPending />;

  return <styled.svg ref={svgRef} display="block" width="100%" />;
}

export function PortfolioChartPending() {
  return (
    <Box
      className={shimmerStyles}
      data-state="loading"
      width="100%"
      height="32px"
      bg="ink.background-secondary"
      borderRadius="sm"
    />
  );
}
