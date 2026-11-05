-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Collection";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_CollectionToProduct";
PRAGMA foreign_keys=on;

-- CreateIndex
CREATE INDEX "CartItem_userId_idx" ON "CartItem"("userId");

-- CreateIndex
CREATE INDEX "LedgerEntry_account_idx" ON "LedgerEntry"("account");

-- CreateIndex
CREATE INDEX "LedgerEntry_transactionId_idx" ON "LedgerEntry"("transactionId");

-- CreateIndex
CREATE INDEX "LedgerTransaction_createdAt_idx" ON "LedgerTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "OrderItem_sellerOrderId_idx" ON "OrderItem"("sellerOrderId");

-- CreateIndex
CREATE INDEX "Product_status_createdAt_idx" ON "Product"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Product_sellerId_idx" ON "Product"("sellerId");

-- CreateIndex
CREATE INDEX "Product_identityId_idx" ON "Product"("identityId");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "SellerOrder_sellerId_status_idx" ON "SellerOrder"("sellerId", "status");

-- CreateIndex
CREATE INDEX "SellerOrder_orderId_idx" ON "SellerOrder"("orderId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

