#!/usr/bin/env node
/**
 * Dog Rescue MCP Server
 * 
 * This Model Context Protocol (MCP) server provides access to dog rescue organizations
 * in the UK, allowing ChatGPT and other AI assistants to help users find rescues near them.
 * 
 * Features:
 * - List all rescue organizations
 * - Find rescues near a specific location (using coordinates)
 * - Get detailed information about a specific rescue
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

// Validate environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: Missing required environment variables');
  console.error('Please set SUPABASE_URL and SUPABASE_ANON_KEY in your environment');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  db: { schema: 'dogadopt' as any }
});

// Types for rescue data
interface Rescue {
  id: string;
  name: string;
  type: string;
  region: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  postcode: string | null;
  charity_number: string | null;
  contact_notes: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  dog_count?: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format rescue data for display
 */
function formatRescue(rescue: Rescue, distance?: number): string {
  const parts = [
    `**${rescue.name}**`,
    `- Type: ${rescue.type}`,
    `- Region: ${rescue.region}`,
  ];
  
  if (distance !== undefined) {
    parts.push(`- Distance: ${distance.toFixed(1)} km`);
  }
  
  if (rescue.dog_count !== undefined) {
    parts.push(`- Available Dogs: ${rescue.dog_count}`);
  }
  
  if (rescue.address) {
    parts.push(`- Address: ${rescue.address}`);
  }
  
  if (rescue.postcode) {
    parts.push(`- Postcode: ${rescue.postcode}`);
  }
  
  if (rescue.phone) {
    parts.push(`- Phone: ${rescue.phone}`);
  }
  
  if (rescue.email) {
    parts.push(`- Email: ${rescue.email}`);
  }
  
  if (rescue.website) {
    parts.push(`- Website: ${rescue.website}`);
  }
  
  if (rescue.charity_number) {
    parts.push(`- Charity Number: ${rescue.charity_number}`);
  }
  
  if (rescue.contact_notes) {
    parts.push(`- Notes: ${rescue.contact_notes}`);
  }
  
  return parts.join('\n');
}

// Create MCP server
const server = new Server(
  {
    name: 'dog-rescue-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_rescues',
        description: 'List all dog rescue organizations in the UK database',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Maximum number of rescues to return (default: 50)',
              default: 50,
            },
          },
        },
      },
      {
        name: 'find_rescues_near',
        description: 'Find dog rescues near a specific location using latitude and longitude. Returns rescues sorted by distance.',
        inputSchema: {
          type: 'object',
          properties: {
            latitude: {
              type: 'number',
              description: 'Latitude of the location to search from',
            },
            longitude: {
              type: 'number',
              description: 'Longitude of the location to search from',
            },
            radius_km: {
              type: 'number',
              description: 'Search radius in kilometers (default: 50)',
              default: 50,
            },
            limit: {
              type: 'number',
              description: 'Maximum number of rescues to return (default: 10)',
              default: 10,
            },
          },
          required: ['latitude', 'longitude'],
        },
      },
      {
        name: 'get_rescue_details',
        description: 'Get detailed information about a specific rescue organization by ID',
        inputSchema: {
          type: 'object',
          properties: {
            rescue_id: {
              type: 'string',
              description: 'The UUID of the rescue organization',
            },
          },
          required: ['rescue_id'],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_rescues': {
        const limit = (args?.limit as number) || 50;
        
        const { data, error } = await supabase.rpc('dogadopt_api.get_rescues');
        
        if (error) throw error;
        
        const rescues = (data || []).slice(0, limit) as Rescue[];
        
        const formatted = rescues.map(rescue => formatRescue(rescue)).join('\n\n');
        
        return {
          content: [
            {
              type: 'text',
              text: `Found ${rescues.length} rescue organizations:\n\n${formatted}`,
            },
          ],
        };
      }

      case 'find_rescues_near': {
        const latitude = args?.latitude as number;
        const longitude = args?.longitude as number;
        const radiusKm = (args?.radius_km as number) || 50;
        const limit = (args?.limit as number) || 10;

        if (!latitude || !longitude) {
          throw new Error('latitude and longitude are required');
        }

        // Fetch all rescues with coordinates
        const { data, error } = await supabase.rpc('dogadopt_api.get_rescues');
        
        if (error) throw error;
        
        const rescues = (data || []) as Rescue[];
        
        // Filter and calculate distances
        const rescuesWithDistance = rescues
          .filter(rescue => rescue.latitude && rescue.longitude)
          .map(rescue => {
            const distance = calculateDistance(
              latitude,
              longitude,
              rescue.latitude!,
              rescue.longitude!
            );
            return { rescue, distance };
          })
          .filter(({ distance }) => distance <= radiusKm)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, limit);

        if (rescuesWithDistance.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `No rescues found within ${radiusKm} km of the specified location (${latitude}, ${longitude}).`,
              },
            ],
          };
        }

        const formatted = rescuesWithDistance
          .map(({ rescue, distance }) => formatRescue(rescue, distance))
          .join('\n\n');

        return {
          content: [
            {
              type: 'text',
              text: `Found ${rescuesWithDistance.length} rescue(s) within ${radiusKm} km:\n\n${formatted}`,
            },
          ],
        };
      }

      case 'get_rescue_details': {
        const rescueId = args?.rescue_id as string;

        if (!rescueId) {
          throw new Error('rescue_id is required');
        }

        // Call the get_rescue function with the ID
        const { data, error } = await supabase.rpc('dogadopt_api.get_rescue', {
          p_rescue_id: rescueId,
        });

        if (error) throw error;

        if (!data || data.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `Rescue with ID ${rescueId} not found.`,
              },
            ],
          };
        }

        const rescue = data[0] as Rescue;
        const formatted = formatRescue(rescue);

        return {
          content: [
            {
              type: 'text',
              text: `Rescue Details:\n\n${formatted}`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Dog Rescue MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
