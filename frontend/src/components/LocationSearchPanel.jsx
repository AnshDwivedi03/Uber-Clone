import React from 'react'
import { MapPin } from 'lucide-react';

const LocationSearchPanel = ({ suggestions, setVehiclePanel, setPanelOpen, setPickup, setDestination, activeField, ...props }) => {

    const handleSuggestionClick = (suggestion) => {
        if (activeField === 'pickup') {
            setPickup(suggestion)
        } else if (activeField === 'drop') {
            setDestination(suggestion)
        }
        // Close suggestions by clearing active field if prop is provided
        if (props.setActiveField) {
            props.setActiveField(null)
        }
    }

    return (
        <div>
            {/* Display fetched suggestions */}
            {
                suggestions.map((elem, idx) => (
                    <div key={idx} onClick={() => handleSuggestionClick(elem)} className='flex gap-4 border-b border-zinc-800 p-3 hover:bg-zinc-800/50 transition-colors cursor-pointer items-center my-2 justify-start first:rounded-t-xl last:rounded-b-xl last:border-b-0'>
                        <h2 className='bg-zinc-800 h-10 w-12 flex items-center justify-center rounded-full text-brand-primary'><MapPin size={20} /></h2>
                        <h4 className='font-medium text-white text-sm'>{elem}</h4>
                    </div>
                ))
            }
        </div>
    )
}

export default LocationSearchPanel