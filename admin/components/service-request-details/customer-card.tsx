'use client';

import React from 'react';
import { User, Phone, Mail, MapPin, Building2 } from 'lucide-react';
import { ServiceRequestDetail } from '@/lib/types/service-requests.types';

interface CustomerCardProps {
  request: ServiceRequestDetail;
}

export function CustomerCard({ request }: CustomerCardProps) {
  const customer = request.customer;
  const address = request.address;

  const customerName = customer
    ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Valued Customer'
    : 'Customer Info Unavailable';

  const companyName = customer?.companyName || null;
  const email = customer?.user?.email || 'N/A';
  const phone = customer?.user?.phone || 'N/A';

  const fullAddress = address
    ? [address.addressLine1, address.addressLine2, address.landmark, address.city, address.state, address.postalCode]
        .filter(Boolean)
        .join(', ')
    : 'Address Not Provided';

  const isAMC = request.source === 'AMC';

  return (
    <div className="bg-white border border-[#c6c6cd] rounded-xl overflow-hidden shadow-xs flex flex-col h-full">
      <div className="px-6 py-3.5 border-b border-[#c6c6cd] bg-[#F8FAFC]">
        <h2 className="text-xs font-mono uppercase tracking-widest font-bold text-[#45464d]">
          Customer Information
        </h2>
      </div>

      <div className="p-6 flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#0b1c30]">{customerName}</h3>
          {isAMC && (
            <span className="px-2 py-0.5 bg-[#dae2fd] text-[#131b2e] text-[10px] rounded uppercase font-bold tracking-wider">
              AMC Active
            </span>
          )}
        </div>

        <div className="space-y-3 pt-3 border-t border-[#c6c6cd]">
          {companyName && (
            <div>
              <p className="text-[10px] text-[#76777d] uppercase tracking-wider font-bold">Company</p>
              <p className="text-xs font-semibold text-[#0b1c30] flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-[#45464d]" />
                <span>{companyName}</span>
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-[#76777d] uppercase tracking-wider font-bold">Phone</p>
              <p className="text-xs font-semibold text-[#0b1c30] font-mono flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-[#45464d]" />
                <span>{phone}</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[#76777d] uppercase tracking-wider font-bold">Email</p>
              <p className="text-xs font-semibold text-[#0b1c30] truncate flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-[#45464d] shrink-0" />
                <span className="truncate">{email}</span>
              </p>
            </div>
          </div>

          <div>
            <p className="text-[10px] text-[#76777d] uppercase tracking-wider font-bold">Service Location</p>
            <p className="text-xs text-[#0b1c30] flex items-start gap-1.5 mt-0.5 leading-relaxed">
              <MapPin className="w-3.5 h-3.5 text-[#45464d] shrink-0 mt-0.5" />
              <span>{fullAddress}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-3 border-t border-[#c6c6cd] bg-[#F8FAFC] flex items-center gap-2">
        <a
          href={`tel:${phone}`}
          className="p-2 hover:bg-slate-200 rounded-lg text-[#0b1c30] transition-colors"
          title="Call Customer"
        >
          <Phone className="w-4 h-4" />
        </a>
        <a
          href={`mailto:${email}`}
          className="p-2 hover:bg-slate-200 rounded-lg text-[#0b1c30] transition-colors"
          title="Email Customer"
        >
          <Mail className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
