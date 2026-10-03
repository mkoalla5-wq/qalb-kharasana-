# Security Specification: Concrete Art Multi-Vendor Marketplace

## 1. Data Invariants
1. **Store Isolation & Integrity**: A vendor can only create, update, or delete products belonging to their verified `storeId` and `vendorId == request.auth.uid`. A vendor cannot modify or delete another vendor's products or store profile.
2. **Super Admin Authority**: Super Admins (`admins/{uid}`) have full oversight: they can remove malicious products, suspend or ban abusive vendors, approve/toggle store status, and manage all marketplace data.
3. **Admin Code & Role Protection**: Normal clients cannot escalate themselves to superadmin or manipulate `isBanned` flags arbitrarily. Admin record creation is strictly protected.
4. **Order Integrity & COD Security**: Customers can submit new COD orders with valid required address and contact fields. Once submitted, order items and total amount cannot be maliciously edited by arbitrary clients. Vendors can only update status of orders containing their store items.
5. **Custom Request Protection**: Anyone can submit a bespoke concrete commission request, but only the requester, store assignee, or super admin can manage or review it.
6. **Public Store & Catalog Browsing**: Public users can read active stores and in-stock concrete products. Suspended stores/products are restricted.
7. **Temporal & ID Constraints**: All IDs conform to strict safe character regex (`^[a-zA-Z0-9_\\-]+$`), sizes are capped, and timestamp writes use `request.time`.

## 2. The "Dirty Dozen" Payloads (Must Return PERMISSION_DENIED)
1. **Privilege Escalation**: Non-admin attempting to write to `/admins/{uid}` with `{ role: 'superadmin' }`.
2. **Cross-Vendor Product Hijack**: Vendor A writing to `/products/{prod1}` with `vendorId: "vendorB"`.
3. **Shadow Field Injection**: Creating a product with malicious shadow field `isVerified: true` or `internalRank: 999`.
4. **Orphaned Product**: Creating a product where `storeId` does not exist or does not belong to the user.
5. **Banned Vendor Action**: Banned user attempting to create new products or modify store details.
6. **Price Tampering in Finalized Order**: Non-admin customer trying to edit order price after creation.
7. **Malicious ID Poisoning**: Storing a product or store with a 2KB buffer overflow document ID or path.
8. **Negative / NaN Price Attack**: Creating a product with `basePriceSAR: -500` or non-numeric price.
9. **Unauthenticated Store Creation**: Anonymous or unauthenticated write to `/stores/{storeId}`.
10. **Store Identity Theft**: Vendor attempting to change `vendorId` or `slug` during update.
11. **Blanket Query Scraping**: Attempting an unrestricted list read on private user records.
12. **Custom Request Status Forgery**: Random user marking custom request as `completed` without authorization.
