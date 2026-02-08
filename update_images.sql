UPDATE "PetImages" SET "OriginalUrl" = REPLACE("OriginalUrl", 'http://localhost:5000', '');
UPDATE "PetImages" SET "ThumbUrl" = REPLACE("ThumbUrl", 'http://localhost:5000', '');
UPDATE "PetImages" SET "LargeUrl" = REPLACE("LargeUrl", 'http://localhost:5000', '');
