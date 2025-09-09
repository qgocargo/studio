import { Button } from "@/components/ui/button";
import { QgoLogo } from "@/components/shared/QgoLogo";
import Image from "next/image";
import Link from "next/link";

const iataLogo = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjAwIDMwMCI+PHBhdGggZD0iTTc0LjggMjY2LjR2LTkyLjNINjAuMXY5Mi4zSDIzdjI4LjdoMTA1di0yOC43SDc0Ljh6bTIwOC42LTI4LjdsMTcuMy05Mi4zaDE4LjlsLTE3LjMgOTIuM0gyODMuNHptNDMuMSAwTDMxMS4xIDc0aDQ0bC0xNS40IDk5LjgtMTUuMyA5Mi42aC00My4xbDE1LjQtOTkuNyAxNS4yLTkyLjdoNDQuMmwzMi44IDE5Mi40aC00My41bC0xNS4yLTkyLjZMMzU1IDc0aC00My42bDE1LjQgOTkuOCAxNS4yIDkyLjZoNDMuMXptMTkxLjYgMjguN2g0My44VjI2Nkg1MTguMnYtOTIuM2gtNDMuOHY5Mi4zaC0yMi41djI4LjdoODYuOHYtMjguN3ptOTYuNSAwaDQzLjdWMTAyLjRoLTM4LjlMNjA0IDc0aDk0djIyMC43aDQzLjh2MjguN0g2MDJWMzAwaC0xLjR6bTE5NS4yLTI4LjdsMTcuMy05Mi4zaDE4LjlsLTE3LjMgOTIuM0g4MTUuM3ptNDMuMSAwTjg0MyA3NGg0NC4xbC0xNS40IDk5LjgtMTUuMyA5Mi42aC00My4xbDE1LjQtOTkuNyAxNS4yLTkyLjdoNDQuMmwzMi44IDE5Mi40aC00My41bC0xNS4yLTkyLjZMOTAwLjUgNzRoLTQzLjZsMTUuNCA5OS44IDE1LjIgOTIuNmg0My4xek0xMDY5LjQgNzRoLTM1LjdsLTU0LjUgMzAwaDQ1LjNsMTEuNC02My42aDUzLjVsMTEuMyA2My42aDQ1LjRMMTA2OS40IDc0em0tNi40IDE4NC4xbC0xOC44LTExMC4xLTE4LjggMTEwLjFoMzcuNnoiLz48L3N2Zz4=";
const wcaLogo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACACAMAAABrZuVzAAAAYFBMVEX///8AQ4sAQIsAP4oAO4kAN4gANIcAOYgAOIkAOYoAN4sAOIjp7fUAOIlso9EAM4a/x94gS5QAT5sAUJgAQYpUkcYAQ4zp7vMAYqEAL4AAKnsALoEAMYIAJ3UAKn4AKX/q7/cAUIyTAAADcklEQVR4nO3b63aqOBSG4fAQQkBtqU3tde//ikdbS1sLtTSS5+z9fn+x504yE8jDDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYF/2+0vV/Vn2+z88G/291v+2F/V21d01q/09A6t/Qf0h1l/a/n7t9X+wn8pP1W2v/c/9mY5Xf2h/a/1r/Vv+1/oV+/sZ+ysdVf+k/lr/tL61/pH+rf4b/Wv9e/3b/jf6z5003V/sB7DPqg81v1V/qf/aP1r/TP+2/5b+y/qP3v6d/rf6H/Uf6596+3f65/pf3t/Z/13/tfenbX9v/2t/W//S3sB+7M820n/Wz/S39lf2h/ZH9lv21/b39v/29/bP9s862j/b79u/21/ar9jf2d/bH9i/2b/bb9u/6l/Zf1f+y/q/9l/Uf6T/Rf1b+i/rH9B/s/1H+i/pH+i/vP6v/Tf13+k/tv6n/R+bY/v/LMP2/8M0/b/1L+yv7J+w/8k+JP/V/kn7D/e/uv+L/f/tP9l/6f9X/Tf6X+6/9f+n/p/6n/d/zv/T/yP/b/xP+h/r/8h/6v+g/4n+g/23+v/3/7X/f/1/8B/d/w7+o/xP81/lv4r+K/iv6b+a/ov5b+u/tv47+e/mv5b+S/kv7b+K/hv4b+G/tv4b+C/gv6L+C/iv57+a/mv5r+a/lv6L+W/rv7b+u/tv6T+k/pP7b+k/pP6L+i/ov6L+i/rv6r+6/qv7j+o/uP7T+0/pP7T+0/ov6L+i/ov5r+a/mv5r+a/mv5b+W/lv67+W/rv7T+w/sP7b+w/pP6T+k/tP6L+k/ov6r+q/uv6r+6/tP7T+2/rP+A/uP4D+w/vP6D+8/tP7L+y/tv6b+m/tv6b+o/sP7D+o/ov6T+s/rP4z+M/rP6T+w/sP7T+s/rP6z+s/rP7z+8/tP6L+i/tv6r+u/pv6b+m/tv6b+m/tv6T+o/rP7D+o/rP6z+o/vP7L+i/sv67+q/ru6r+u/uv6j+o/rP4j+I/vP6j+q/uP4j+0/pP6T+0/pP7T+i/qv6L+q/kv5r+a/mv5r+a/kv6b+u/tu6b+u/tu47+e/tv47+O/jv5r+K/tv4b+G/hv4b+e/gv4L+K/gv4b+e/lv5r+a/mv5b+a/mv5r+O/jv67+e/rv7T+g/tP6j+o/qP6j+g/pP6j+k/qP7T+g/tP6T+8/qP7j+q/uP6z+s/vP6z+u/vP67+w/sP7T+w/sP7T+y/sv6j+i/qP6L+m/qP6r+m/rP4D+w/oP6L+y/sP7L+o/pP6T+i/tP6L+0/pP6T+2/pP7b+2/rP67+u/uP4j+4/pP7j+s/pP7z+4/uP6j+w/sP7T+g/pP6z+y/uP6j+8/qP7z+i/rP6z+g/qP6z+o/qP6z+k/rP6T+8/qP7T+k/qP6T+k/qP6T+k/qP6L+wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgH/9A7aQ4B/4cQ/qAAAAAElFTkSuQmCC";
const iamLogo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARgAAACACAMAAAB49WnWAAAAQlBMVEX////AADcAAADa2tsAADOysrL6+voAAAb29vYAAAnMzMzp6ekAAAjh4eEAABBMS0toamp+fn4AAATExMSlpaWbm5s2NjZLS0s6ODgI5M0QAAAD0klEQVR4nO2byXaCMAxFIVsJsbrD/V/hAvJpMu6Nplk5/29EDgp6cFAggAAAAAAAAAAAAAAAAAAAAAAAIzY+np29PX5qQ+kPkD6/uG58S+pD3A+hPjH3R8W/tD6Yen3n/5+gr8l/b30x9cfsH/V35n6A+ovU39p/bX1D63/YP/n/S+rv7z+o/tvqn9y/3f+B/kf/L/r/4T/Jf8h98f8P/Nf83/V/zn/Q/4L/z/V/0f/F/1/+b/j/1r/zP+h/wP/R/y//x+3f7b/1/6v/h/6v+P/kP+x/4P/v/o/4f+c/1v+D/0/7X/w/1n/uP5b/g/97/A/1P/d/yn/f/v/2v/j/h/7f+z/iP/X/wP/9/1f8v/A/7v/T//w8//+v5X/P/u/8H/e/+H/d/wv/F/wv+7/X/3//x/7f+D/j/9r/Gf/P/j/+r/6f8//T/t/+D/h/9v/Bf4r/f/2/9v/S/+f+B/8P+v/r/9//T/v/5X/d/yv+l/3f9//Vf8H/N/xf+T/qf+n/rf9//I/8/+X/4P+T/h/6v/N/7v/B/2f9L/2/8p/2/+T/6v/J/wP/F/wv/7/B/5v/5/5v/x/6/+l/5v/1/zP/T/rf/z/p/4v/b/3/+7/t/+f+D/6v9b/w/+D/3v+D/3v8T/t/7f9T/t/7v/r/yP/h/yP/7/8H/h/+H/5f8X/r/5X/v/2/8v/P/w//r/j/8//Gf8//lf+f+r/2/+n/f/zP/H/0P+H/9/+r/6/9P/e/+H/D/0P/B/3P/J/0v+3/l/6v/V/0f+z/m/63/b/yP+n/0f9//X/9v+3/r/8H/H/7f/P/wv+T/9f8X/H/4v+f/n/6X/h/7P/T/xv+X/w/+b/gP+p/w/9X/N/5v+x/yP/p/z/9D/g/57/O/7P+j/sf+D/g/53/E/5/+T/pf9n/W/6v+B/8f+d/yv+7/2f8f/e/6/+P/x//F//P+v/of+n/h/5P+f/kf+X/pf8n/S/5v+v/of9n/Q/9P/a/7P+t/w/8v/U/5P+l/xf9P/I/6X/B/4v/R/y//H/if9v/Q/4P+T/sf/D/9/+t/3f+D/lf93/D/9/+d/3f8v/W/9/+n/v/43/e/yv/L/8f8v/d/0f/b/sf/7/l/+n/x/6v/L/zP/d/3P/H/s/73/n/y//n/z/8n/Q/93/b/w//n/9/7/9D/4f+j/z/8z/f/7v/D/wf+D/qf/z/j/6n/d/y/+b/2/+T/if+H/k/4H/m/5H/i/+v/b/+f+3/l/4X/9/wf+j/of93/N/8P/f/wf87/O/8//E/7/+H/lf8n/F/wf9T/Gf9X/E/6H/F/0P+7/z/+x/z/+l/3/8j/T/yv+x/wv+z/r/8P/H/y//n/l/8v/v/4P+x/4P/p/7f9n/n/6H/e/+H/u/7v+x/8f+L/3f+D/2/+D/uf+L/g/7H/s/8v/V/7f+z/wf9z/N/8H/h/+3/n/9v/f/of+n/if9X/U/9v/s/4v/J/xv/9/zv9D/q/93/q/5n/l/2/9j/x/+T/sf9P/X/4v/h/x//B/4v+x/8/9T/c/8f/+/4n/+/4n/i/8X/Q/9v/e/6H/l/43/K/8X/y/6X/D/1P+H/3/+z/m/+r/p/+3/g/4H/p/73/1/6f+v/qf9X/QAAAAAAAAAAAAAAAAAAAAAAAOCZf9t2f3r9c8sCAAAAAElFTkSuQmCC";

export default function PublicPodView({ pod }: { pod: any }) {
    const jobData = pod.jobFileData || {};
    const deliveryDate = new Date(pod.completedAt).toLocaleString();

    let locationInfo = pod.geolocationName || 'Not Captured.';
    if (pod.geolocation) {
        locationInfo += ` `;
    }

    return (
        <div className="bg-background min-h-screen py-8">
            <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 bg-card rounded-xl shadow-lg">
                <div className="space-y-4 text-gray-800">
                    <div className="flex flex-col sm:flex-row justify-between items-start pb-4 border-b-2 border-gray-200">
                        <div>
                           <QgoLogo className="text-4xl" />
                           <p className="text-xs text-gray-500">www.qgocargo.com</p>
                           <p className="text-xs text-gray-500 italic">Formerly known as Boodai Aviation Group</p>
                        </div>
                        <div className="text-right text-xs mt-4 sm:mt-0">
                           <p className="font-bold">CARGO DIVISION</p>
                           <p>A/F Cargo Complex, Waha Mall,</p>
                           <p>Ground Floor, Office # 28, Kuwait</p>
                           <p>Tel: 1887887, 22087411/2</p>
                           <p>Email: cargo@qgoaviation.com</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-between items-start pt-2 gap-4">
                        <h2 className="text-2xl font-bold text-gray-700">PROOF OF DELIVERY</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                        <div><strong className="text-gray-500 block">Job File No:</strong> <span className="font-mono">{jobData.jfn || 'N/A'}</span></div>
                        <div><strong className="text-gray-500 block">Invoice No:</strong> <span className="font-mono">{jobData.in || 'N/A'}</span></div>
                        <div><strong className="text-gray-500 block">AWB / MAWB:</strong> <span className="font-mono">{jobData.mawb || 'N/A'}</span></div>
                        <div><strong className="text-gray-500 block">Airlines:</strong> {jobData.ca || 'N/A'}</div>
                        <div><strong className="text-gray-500 block">Shipper:</strong> {jobData.sh || 'N/A'}</div>
                        <div><strong className="text-gray-500 block">Consignee:</strong> {jobData.co || 'N/A'}</div>
                        <div><strong className="text-gray-500 block">Origin:</strong> {jobData.or || 'N/A'}</div>
                        <div><strong className="text-gray-500 block">Destination:</strong> {jobData.de || 'N/A'}</div>
                        <div className="col-span-1 sm:col-span-2"><strong className="text-gray-500 block">Description:</strong> {jobData.dsc || 'N/A'}</div>
                        <div className="col-span-1 sm:col-span-2"><strong className="text-gray-500 block">Gross Weight:</strong> {jobData.gw || 'N/A'}</div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border">
                        <h4 className="font-bold text-lg mb-3">Delivery Confirmation</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                            <div><strong className="text-gray-500 block">Delivered To:</strong> {pod.receiverName}</div>
                            <div><strong className="text-gray-500 block">Contact:</strong> {pod.receiverMobile}</div>
                            <div className="col-span-1 sm:col-span-2"><strong className="text-gray-500 block">Date & Time:</strong> {deliveryDate}</div>
                            <div className="col-span-1 sm:col-span-2"><strong className="text-gray-500 block">Delivery Address:</strong> {pod.deliveryLocation}</div>
                            <div className="col-span-1 sm:col-span-2">
                                <strong className="text-gray-500 block">GPS Location:</strong> {locationInfo}
                                {pod.geolocation && (
                                    <Link href={`https://www.google.com/maps?q=${pod.geolocation.lat},${pod.geolocation.lng}`} target="_blank" className="text-primary hover:underline text-xs ml-2">[View on Map]</Link>
                                )}
                            </div>
                            <div className="col-span-1 sm:col-span-2"><strong className="text-gray-500 block">POD Confirmed By (Driver):</strong> {pod.driverName}</div>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                            <p className="text-gray-600 text-sm italic mb-2">"I, <strong>{pod.receiverName}</strong>, confirm I have received this shipment from the driver, <strong>{pod.driverName}</strong>, in good condition on the date specified above."</p>
                            <p className="text-gray-500 text-sm font-bold mb-1">Receiver's Signature:</p>
                            <Image src={pod.signatureDataUrl} alt="Signature" width={192} height={96} className="bg-white border-2 p-1 rounded-md shadow-inner"/>
                        </div>
                    </div>

                    <div className="pt-4 border-t-2 border-gray-200 text-xs text-gray-600 space-y-3">
                       <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4 flex-wrap justify-center">
                               <Image src={iataLogo} alt="IATA Logo" width={80} height={24} className="h-6 object-contain" />
                               <Image src={wcaLogo} alt="WCA Logo" width={100} height={32} className="h-8 object-contain" />
                               <Image src={iamLogo} alt="IAM Logo" width={100} height={32} className="h-8 object-contain" />
                            </div>
                            <p className="font-semibold text-center sm:text-right">We are your one-stop-shop for logistics solutions.</p>
                       </div>
                       <div className="text-center border-t pt-3 mt-3">
                           <p className="font-bold">Q'GO TRAVEL & TOURISM COMPANY W.L.L</p>
                           <p>Address: P.O. Box 5798 Safat 13058 Kuwait | Tel: 1 887 887 | Fax: 22087419</p>
                       </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
