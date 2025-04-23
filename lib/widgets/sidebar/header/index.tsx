'use client'

import React, { useState } from 'react'
import { MapPin, ChevronsUpDown, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandInput, CommandList, CommandItem, CommandGroup, CommandSeparator } from '@/components/ui/command'

const locations = [
    {
        name: 'New York',
        value: 'new-york'
    },
    {
        name: 'Los Angeles',
        value: 'los-angeles'
    },
    {
        name: 'Chicago',
        value: 'chicago'
    }
]
const SidebarHeader = () => {
  const [selectedLocation, setSelectedLocation] = useState('New York')
  return (
    <Popover>
        <PopoverTrigger asChild>
            <Button variant='ghost' className='h-auto cursor-pointer'>
                <div className='flex items-center justify-between gap-2 w-full py-1'>
                    <div className='flex items-center justify-start gap-2'>
                        <div className='bg-gray-950 rounded-md w-12 h-12 flex items-center justify-center'>
                            <MapPin size={24} color='white' transform='scale(1.5)'/>
                        </div>
                        <div className='flex flex-col justify-start items-start gap-0'>
                            <p className='text-base font-medium'>
                                Location
                            </p>
                            <p className='text-sm font-normal'>
                                {selectedLocation}
                            </p>
                        </div>
                    </div>
                    <ChevronsUpDown size={20}/>
                </div>
            </Button>
        </PopoverTrigger>
        <PopoverContent side='right' align='start'>
            <Command>
                <CommandInput placeholder='Search location...' />
                <CommandGroup>
                    <CommandList>
                        {locations.map((location) => (
                            <CommandItem key={location.value} onSelect={() => setSelectedLocation(location.name)}>
                                {location.name}
                            </CommandItem>
                        ))}
                    </CommandList>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup>
                    <CommandList>
                        <CommandItem>
                            <Plus size={16}/>
                            Add Location
                        </CommandItem>
                    </CommandList>
                </CommandGroup>
            </Command>
         </PopoverContent>
    </Popover>
  )
}

export default SidebarHeader