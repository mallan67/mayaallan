-- CreateTable
CREATE TABLE "Book" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle1" TEXT,
    "subtitle2" TEXT,
    "tagsCsv" TEXT,
    "isbn" TEXT,
    "copyright" TEXT,
    "blurb" TEXT,
    "coverUrl" TEXT,
    "backCoverUrl" TEXT,
    "ebookFileUrl" TEXT,
    "hasEbook" BOOLEAN NOT NULL DEFAULT true,
    "hasPaperback" BOOLEAN NOT NULL DEFAULT false,
    "hasHardcover" BOOLEAN NOT NULL DEFAULT false,
    "ebookPrice" DECIMAL(10,2),
    "paperbackPrice" DECIMAL(10,2),
    "hardcoverPrice" DECIMAL(10,2),
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT false,
    "isComingSoon" BOOLEAN NOT NULL DEFAULT false,
    "allowDirectSale" BOOLEAN NOT NULL DEFAULT false,
    "allowRetailerSale" BOOLEAN NOT NULL DEFAULT false,
    "stripePaymentLink" TEXT,
    "paypalPaymentLink" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "ogImageUrl" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Retailer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "iconUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Retailer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookRetailerLink" (
    "id" SERIAL NOT NULL,
    "bookId" INTEGER NOT NULL,
    "retailerId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "formatType" TEXT NOT NULL DEFAULT 'ebook',
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "BookRetailerLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaItem" (
    "id" SERIAL NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'audio',
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverUrl" TEXT,
    "fileUrl" TEXT,
    "externalUrl" TEXT,
    "duration" TEXT,
    "publishedAt" TIMESTAMP(3),
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT false,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "locationText" TEXT,
    "locationUrl" TEXT,
    "eventImageUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT false,
    "keepVisibleAfterEnd" BOOLEAN NOT NULL DEFAULT false,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactSubmission" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "message" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailSubscriber" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NavigationItem" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "NavigationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "siteName" TEXT NOT NULL DEFAULT 'Maya Allan',
    "tagline" TEXT,
    "contactEmail" TEXT,
    "socialTwitter" TEXT,
    "socialInstagram" TEXT,
    "socialFacebook" TEXT,
    "socialYoutube" TEXT,
    "socialTiktok" TEXT,
    "footerText" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Book_slug_key" ON "Book"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Retailer_slug_key" ON "Retailer"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BookRetailerLink_bookId_retailerId_formatType_key" ON "BookRetailerLink"("bookId", "retailerId", "formatType");

-- CreateIndex
CREATE UNIQUE INDEX "MediaItem_slug_key" ON "MediaItem"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "EmailSubscriber_email_key" ON "EmailSubscriber"("email");

-- AddForeignKey
ALTER TABLE "BookRetailerLink" ADD CONSTRAINT "BookRetailerLink_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookRetailerLink" ADD CONSTRAINT "BookRetailerLink_retailerId_fkey" FOREIGN KEY ("retailerId") REFERENCES "Retailer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
