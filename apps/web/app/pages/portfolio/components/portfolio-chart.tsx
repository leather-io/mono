import { useEffect, useMemo, useRef } from 'react';

import * as d3 from 'd3';
import { HTMLStyledProps, styled } from 'leather-styles/jsx';

import { Sip10Balance } from '@leather.io/services';

import { usePortfolioEvents } from '../portfolio-events';

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
  assets: Sip10Balance[];
}

export function PortfolioChart({ assets, ...props }: PortfolioChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { emitAssetHoverOn, emitAssetHoverOff } = usePortfolioEvents(symbol => {
    console.log('element hovered on listener chart', symbol);
  });

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

    if (itemsToGroup.length === 0) return rawData;

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

        g.selectAll('rect')
          .data(portfolioData)
          .enter()
          .append('rect')
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
          .style('cursor', 'pointer')
          .on('mouseover', (event, d) => {
            emitAssetHoverOn(d.token);
            tooltip.style('visibility', 'visible').html(`${d.token}: ${d.percentage}%`);
          })
          .on('mousemove', event => {
            tooltip.style('top', `${event.pageY - 40}px`).style('left', `${event.pageX - 50}px`);
          })
          .on('mouseout', () => {
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
  }, [portfolioData]);

  return <styled.svg ref={svgRef} display="block" width="100%" {...props} />;
}
