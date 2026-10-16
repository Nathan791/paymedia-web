import { prisma } from "../src/index.js";



async function main() {

    console.log("🌱 Starting database seed...");


    // 1 - Création du rôle ADMIN

    const adminRole = await prisma.pm_role.upsert({
        where: {
            code: "SUPER_ADMIN",
        },

        update: {},

        create: {
            ulid: "01JADMINROLE000000000000000",
            code: "SUPER_ADMIN",
            label: "Super Administrator",
            level: 100,
            is_active: true,
        },
    });



    // 2 - Création de l'utilisateur

    const passwordHash = await hashPassword(
        "Admin123@"
    );


    const adminUser = await prisma.pm_user.upsert({

        where: {
            email: "admin@paymedia.com",
        },


        update: {},


        create: {

            ulid: "01JADMINUSER000000000000000",

            username: "admin",

            email: "admin@paymedia.com",

            password_hash: passwordHash,

            country_code: "CM",

            is_active: true,

            is_verified: true,
        },
    });



    // 3 - Association utilisateur / rôle

    await prisma.pm_user_role.upsert({

        where: {
            user_id_role_id: {
                user_id: adminUser.id,
                role_id: adminRole.id,
            },
        },


        update: {},


        create: {

            ulid: "01JADMINUSERROLE00000000000",

            user_id: adminUser.id,

            role_id: adminRole.id,

        },

    });


    console.log("✅ Admin created");
    console.log({
        email: "admin@paymedia.com",
        password: "Admin123@",
    });

}



main()

    .then(async()=>{

        await prisma.$disconnect();

    })

    .catch(async(error)=>{

        console.error(error);

        await prisma.$disconnect();

        process.exit(1);

    });