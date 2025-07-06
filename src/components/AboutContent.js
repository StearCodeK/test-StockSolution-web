// src/components/AboutContent.js
import Image from 'next/image';

export default function AboutContent() {
    return (
        <div className="about-content">
            <h1>Hidroponías Venezolanas</h1>
            <p>Sembrando Salud desde 1972.</p>

            {
                <div className="main-image">
                    <Image
                        src="/hidroponias/Hidroponeas venezolanas.jpg"
                        alt="Hidroponías Venezolanas"
                        width={500}
                        height={200}
                        className="about-image"
                    />
                </div>
            }

            <section>
                <h2>Misión</h2>
                <p>
                    Brindar productos de calidad en el sector de alimentos, generando beneficios a sus trabajadores, clientes y con el desarrollo local y regional, respetando el medio ambiente y siendo responsable socialmente.
                </p>
            </section>

            <section>
                <h2>Visión</h2>
                <p>Ser los líderes en calidad dentro del sector de alimentos mínimamente procesados.</p>
            </section>

            <section>
                <h2>Hidroponias Venezolanas... mas que una empresa;</h2>
                <p>
                    Fundada en 1972, Hidroponias Venezolanas siempre se ha caracterizado por ser una empresa familiar. Enfocados en complacer las exigencias del mercado Venezolano, trabajamos en equipo dia tras dia para poder satisfacer las necesidades de nuestros clientes. Es a traves de la tecnologia lider en el ambito Hidroponico, junto con nuestro gran equipo de trabajo como logramos producir los mejores y mas frescos vegetales del mercado Venezolano.
                </p>

                {/* GALERÍA DE IMÁGENES AQUÍ - Reemplaza con esto:
                <div className="image-gallery">
                    <Image
                        src="/ruta/a/imagen1.jpg"
                        alt="Descripción imagen 1"
                        width={300}
                        height={200}
                    />
                    <Image
                        src="/ruta/a/imagen2.jpg"
                        alt="Descripción imagen 2"
                        width={300}
                        height={200}
                    />
                    // Añade más imágenes según necesites
                </div>
                */}
            </section>

            <section>
                <h2>Nuestra Historia</h2>
                <p>
                    Fundada en 1972, Hidroponías Venezolanas siempre se ha caracterizado por ser una empresa familiar. Enfocados en complacer las exigencias del mercado Venezolano, trabajamos en equipo día tras día para poder satisfacer las necesidades de nuestros clientes.
                </p>
            </section>

            <section>
                <h2>Productos Hidropónicos de Primera Calidad</h2>
                <p>
                    La emitologia de la palabra hidroponia proviene del griego Hidro=Agua y Ponia=Cultivo, por ende, son los cultivos con nutrato en agua. En la modernidad el termino de Cultivos Hidroponicos se ha ampliado un poco, relacionando este, con cultivos sin contacto con tierra. Ya sea piedra pomez, acerrin de coco, o simplemente caneltas en donde el agua donde si mezcla una solucion quimica para que esta sirva de nutrato para la planta cicla.
                </p>

                {
                    <Image
                        src="/hidroponias/Tecnica Hidroponica.jpg"
                        alt="Productos hidropónicos"
                        width={600}
                        height={400}
                        className="product-image"
                    />
                }

                <p>
                    Entre nuestros cultivos hidroponicos encontraran los siguientes; Berro, Alfalfa, Grano Chino, Tomate Manzano, Tomamte Cherry y dependiendo de la epoca del ano Lechuga, Rucula y Radiccio.
                </p>


            </section>

            <section>
                <h2>PRODUCTOS CULTIVADOS CON TÉCNICA TRADICIONAL</h2>
                <p>
                    Los productos &quot;agroponicos&quot; o no hidroponicos, son aquellos que tienen contacto directo con el suelo. Del mismo suelo estas plantas sacaran sus nutrientes y todo lo necesario para crecer.
                </p>
                <p>
                    Entre nuestro productos agroponicos o &quot;no hidroponicos&quot; encontraran los siguientes: Maiz, Cebollin, Lechuga de Campo, Radiccio y Rucula.
                </p>

                {
                    <Image
                        src="/hidroponias/Cebollin.jpg"
                        alt="Productos hidropónicos"
                        width={600}
                        height={400}
                        className="product-image"
                    />
                }
            </section>

            <section>
                <h2>Mano a mano con tecnologia de punta...</h2>
                <p>
                    Dependiendo de la temporada tendremos produccion/cosecha de nuestros distintos productos. Encuentra fotos de nuestras instalaciones y maquinarias para procesar Lechuga, Tomate, Cebollin, Alfalfa y Grano Chino.
                </p>
                <h3>Cosecha de Alfalfa</h3>
                <p>
                    La alfalfa es uno de nuestros productos de mas rapida cosecha. En menos de una semana tenemos la oportunidad de cosechar nuestra alfalfa. Gracias a un proceso en el cual utilizamos luz ultravioleta para ayudar el proceso de fotosintesis, podemos cosechar en un rango de 4 a 5 dias.
                </p>

                {
                    <Image
                        src="/hidroponias/Alfalfa.jpg"
                        alt="Productos hidropónicos"
                        width={600}
                        height={400}
                        className="product-image"
                    />
                }

                <h3>Invernaderos de Tomate</h3>
                <p>
                    Gracias a nuestros Invernaderos podemos contralar un poco la temperatura y plagas que tenemos al rededor de nuestra zona. Este nos ayuda a proteger nuestras plantas para que estas lleguen en el mejor estado posible a nuestros consumidores.
                </p>

                {
                    <Image
                        src="/hidroponias/Invernaderos Tomate.jpg"
                        alt="Productos hidropónicos"
                        width={600}
                        height={400}
                        className="product-image"
                    />
                }

                <h3>Plantas de IV y I Gama</h3>
                <p>
                    Contamos con Plantas de IV y I gama para procesar Vegetales y Frutas. De esta manera hemos sido capaces de aumentar nuestra eficiencia y productividad, junto a mejorar la calidad de nuestros productos. Inversiones e esfuerzos como estos, son los que nos impulsan y motivan a llevarles a sus casas los productos de mas alta calidad.
                </p>

                {
                    <Image
                        src="/hidroponias/IV Gama.jpg"
                        alt="Productos hidropónicos"
                        width={600}
                        height={400}
                        className="product-image"
                    />
                }

                <h3>Terrazas de Campo Abierto</h3>
                <p>
                    Dependiendo de la temporada y factores externos a la compania, en algunas ocaciones al ano podemos sembrar y cosechar al aire libre. Productos como Cebollin, Maiz y Berro son algunos de los que sembramos bajo este metodo tradicional. Nuestra alianza con algunos productores de la zona, nos ayudan a mantener la oferta en los momentos que no tenemos produccion.
                </p>

                {
                    <Image
                        src="/hidroponias/Terrazas de Campo Abierto.jpg"
                        alt="Productos hidropónicos"
                        width={600}
                        height={400}
                        className="product-image"
                    />
                }
            </section>
        </div>
    );
}